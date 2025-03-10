import { NetworkError } from "middleware/errorHandler.middleware";
import { FriendsTable, PostReactionTable, PostTable, UserTable } from "models";
import { EReactionType, IBase, ICreatePost } from "types";
import { ObjectId } from "mongodb";

class PostService {
  /**
   * @description create post
   * @param postDeatils post details
   * @returns {true}
   */
  public async createPost(postDeatils: ICreatePost): Promise<boolean> {
    try {
      await Promise.all([
        PostTable.create(postDeatils),
        UserTable.findOneAndUpdate(
          { _id: postDeatils.userId },
          { $inc: { posts: 1 } }
        ),
      ]);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description get all posts created by a user
   * @param userId
   * @returns {posts} list of posts
   */
  public async getAllPostByUser(
    userId: string
  ): Promise<Array<Partial<IBase>>> {
    try {
      const posts = await PostTable.find(
        { userId },
        {
          _id: 1,
          userId: 1,
          post: 1,
          type: 1,
          createdAt: 1,
          edited: 1,
          reactions: 1,
          comments: 1,
        }
      )
        .lean()
        .sort({ createdAt: -1 })
        .populate("userId");
      return posts;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description get post details for the given post
   * @param postId
   * @returns {post} post details
   */
  public async getPostById(postId: string): Promise<Partial<IBase>> {
    try {
      const post = await PostTable.findById(
        { _id: postId },
        { _id: 1, post: 1, type: 1, edited: 1, createdAt: 1, reactions: 1 }
      ).lean();
      if (!post) {
        throw new NetworkError("Post not found", 400);
      }
      return post;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description delete the given post of the logged user
   * @param user
   * @param postId post to be deleted
   */
  public async deleteUserPost(user: any, postId: any): Promise<void> {
    try {
      await Promise.all([
        PostTable.findOneAndDelete({
          _id: postId,
          userId: user?._id,
        }).lean(),
        UserTable.findOneAndUpdate({ _id: user._id }, { $inc: { posts: -1 } }),
      ]);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description update the content of the post
   * @param userId
   * @param postId postId of the post to be updated
   * @param post update post content
   * @returns {posts} list of posts
   */
  public async editOrUpdatePost(
    userId: string,
    postId: string,
    post: string
  ): Promise<void> {
    try {
      await PostTable.findOneAndUpdate(
        { _id: postId, userId },
        { post, edited: true }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description get feed content for user
   * @param userId
   * @returns {posts} list of posts
   */
  public async getUserFeed(userId: string): Promise<any> {
    try {
      const usersFollowed = await FriendsTable.find({
        followerId: new ObjectId(userId),
      }).select("followeeId");
      const userIds = [
        new ObjectId(userId),
        ...usersFollowed.map((f) => f.followeeId),
      ];
      const feed = await PostTable.aggregate([
        {
          $match: {
            userId: { $in: userIds },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $lookup: {
            from: "post_reactions",
            let: { postId: "$_id", userId: new ObjectId(userId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$postId", "$$postId"] },
                      { $eq: ["$userId", "$$userId"] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "userReaction",
          },
        },
        {
          $project: {
            _id: 1,
            post: 1,
            type: 1,
            edited: 1,
            createdAt: 1,
            reactions: 1,
            comments: 1,
            userId: {
              _id: "$userDetails._id",
              firstName: "$userDetails.firstName",
              lastName: "$userDetails.lastName",
              profile_pic: "$userDetails.profile_pic",
              createdAt: "$userDetails.createdAt",
            },
            liked: {
              $cond: {
                if: { $gt: [{ $size: "$userReaction" }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]).exec();
      return feed;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description add a user reaction on a post
   * @param userId
   * @param postId postId of the post to be updated
   * @param reaction reaction of user on post
   * @returns {posts} list of posts
   */
  public async likePost(
    userId: string,
    postId: string,
    reaction: string = EReactionType.LIKE
  ): Promise<void> {
    try {
      await Promise.all([
        PostReactionTable.findOneAndUpdate(
          { postId, userId },
          {
            $set: {
              postId,
              userId,
              type: reaction,
            },
          },
          { upsert: true, new: true }
        ),
        PostTable.findOneAndUpdate(
          { _id: new ObjectId(postId) },
          { $inc: { reactions: 1 } }
        ),
      ]);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description remove reaction from the post
   * @param userId
   * @param postId postId of the post to be updated
   * @returns {posts} list of posts
   */
  public async dislikePost(userId: string, postId: string): Promise<void> {
    try {
      await Promise.all([
        PostReactionTable.findOneAndDelete({ postId, userId }),
        PostTable.findOneAndUpdate(
          { _id: new ObjectId(postId) },
          { $inc: { reactions: -1 } }
        ),
      ]);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new PostService();
