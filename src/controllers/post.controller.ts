import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { PostService, UserService, FollowService, AIService } from "services";
import { ICreatePost } from "types";
import {
  CACHING,
  getDataFromCache,
  POST_TYPE,
  REDIS_KEYS,
  setDataToCache,
  SUCCESS_MSGS,
} from "utils";
import { postValidations } from "validations";
import { RequireActiveUser } from "middleware";
import Config from "../config";
import { cloudinary } from "utils";
import { Readable } from "stream";

class PostController extends BaseController {
  @RequireActiveUser()
  async createPost(req: any, res: Response, next: NextFunction) {
    return postValidations.createPostValidation(
      req,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, body, files } = req;
            // if (!files || !files.length) {
            //   return this.BadRequest(res, "Please upload at least one file.");
            // }

            const uploadedUrls: string[] = [];
            const uploadToCloudinary = (
              fileBuffer: Buffer
            ): Promise<string> => {
              return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.v2.uploader.upload_stream(
                  { resource_type: "auto" },
                  (error, result) => {
                    if (error) return reject(error);
                    resolve(result?.secure_url || "");
                  }
                );

                const stream = new Readable();
                stream._read = () => {};
                stream.push(fileBuffer);
                stream.push(null);
                stream.pipe(uploadStream);
              });
            };

            // Upload all files in parallel
            for (const file of files) {
              const url = await uploadToCloudinary(file.buffer);
              uploadedUrls.push(url);
            }
            // Content moderation check
            console.log("=========Moderation Check=========");
            console.log('body.post', body.post);
            if (body.post && body.post.trim()) {
              try {
                const moderationResult = await AIService.moderateContent(body.post);
                
                if (!moderationResult.is_safe) {
                  return this.BadRequest(res, 
                    `Your post contains inappropriate content. Reasons: ${moderationResult.flagged_reasons.join(', ')}`
                  );
                }
                
                // Warning for moderate toxicity
                if (moderationResult.flagged_reasons.includes('moderate_toxicity')) {
                  console.log(`Warning: Post by user ${_id} has moderate toxicity`);
                }
              } catch (moderationError) {
                console.error('Moderation check failed:', moderationError);
                // Continue with post creation if moderation service is down
              }
            }
            console.log("=========Moderation Check End=========");
            const postObj: ICreatePost = {
              userId: _id,
              post: body.post,
              type: POST_TYPE.TEXT,
              attachments: uploadedUrls,
            };

            await PostService.createPost(postObj);
            this.Ok(res, { message: SUCCESS_MSGS.POST_CREATED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async getPostByUser(req: any, res: Response, next: NextFunction) {
    return postValidations.getPostsValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, params } = req;
            const [isPublicProfile, ifUserFollowed] = await Promise.all([
              UserService.isPublicProfile(params.userId),
              FollowService.ifUserFollowed(_id, params.userId),
            ]);
            if (isPublicProfile || ifUserFollowed || _id == params.userId) {
              const posts = await PostService.getAllPostByUser(params.userId);
              this.Ok(res, { posts });
            } else {
              this.Ok(res, {
                message: "This is a private profile. Send request to follow.",
              });
            }
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async getPostById(req: any, res: Response, next: NextFunction) {
    return postValidations.getPostDetailsUsingIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { params } = req;
            const post = await PostService.getPostById(params.postId);
            this.Ok(res, { post });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async deleteUserPostById(req: any, res: Response, next: NextFunction) {
    return postValidations.deletePostByIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, params } = req;
            await PostService.deleteUserPost(_id, params.postId);
            this.Ok(res, { message: SUCCESS_MSGS.POST_DELETED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async getMyPosts(req: any, res: Response, next: NextFunction) {
    try {
      const posts = await PostService.getAllPostByUser(req._id);
      this.Ok(res, { posts });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  @RequireActiveUser()
  async editOrUpdatePost(req: any, res: Response, next: NextFunction) {
    return postValidations.editOrUpdatePostValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              _id,
              body: { postId, post },
            } = req;
            await PostService.editOrUpdatePost(_id, postId, post);
            this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async getMyFeed(req: any, res: Response, next: NextFunction) {
    try {
      const feedType = req.query.type || 'latest'; // 'latest' or 'recommended'
      const page = Number(req.query.page as string) || 1;
      const limit = 10;

      // Check cache only for non-AI feeds
      if (Config.CACHING === CACHING.ENABLED && feedType === 'latest') {
        const cachedData = await getDataFromCache(
          `${REDIS_KEYS.GET_MY_FEED}_${req._id}_page_${req.query.page}`
        );
        if (cachedData) {
          return this.Ok(res, JSON.parse(cachedData));
        }
      }

      let posts: any[] = [];
      let aiPowered = false;

      // AI-recommended feed
      if (feedType === 'recommended') {
        try {
          const aiResponse = await AIService.getPostRecommendations(
            req._id,
            limit,
            page
          );
          
          if (aiResponse && aiResponse.post_ids && aiResponse.post_ids.length > 0) {
            // Fetch full post details
            const postDetails = await PostService.getPostsByIds(aiResponse.post_ids);
            posts = postDetails;
            aiPowered = true;
          }
        } catch (aiError) {
          console.error('AI feed failed, falling back to chronological:', aiError);
        }
      }

      // Fallback to chronological feed
      if (posts.length === 0) {
        const feedData = await PostService.getUserFeed(req._id, page, limit);
        posts = feedData.feed;
        
        if (Config.CACHING === CACHING.ENABLED && feedType === 'latest') {
          setDataToCache(
            `${REDIS_KEYS.GET_MY_FEED}_${req._id}_page_${req.query.page}`,
            JSON.stringify({ posts })
          );
        }
        
        return this.Ok(res, {
          posts,
          currentPage: feedData.currentPage,
          totalPosts: feedData.totalPosts,
          totalPages: feedData.totalPages,
          feed_type: 'latest'
        });
      }

      this.Ok(res, {
        posts,
        currentPage: page,
        totalPosts: posts.length,
        totalPages: 1,
        feed_type: aiPowered ? 'recommended' : 'latest',
        ai_powered: aiPowered
      });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  @RequireActiveUser()
  async likePost(req: any, res: Response, next: NextFunction) {
    return postValidations.addReactionOnPost(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, body } = req;
            const posts = await PostService.likePost(_id, body.postId);
            this.Ok(res, { posts });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  @RequireActiveUser()
  async dislikePost(req: any, res: Response, next: NextFunction) {
    return postValidations.removeReactionOnPost(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, body } = req;
            const posts = await PostService.dislikePost(_id, body.postId);
            this.Ok(res, { posts });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new PostController();
