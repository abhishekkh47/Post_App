import { CommentTable, PostTable } from "models";
import { NetworkError } from "middleware";
import type { IComment } from "types";
import { ECommentType } from "types";
import { ObjectId } from "mongodb";

class CommentService {
  /**
   * @description Create a new comment
   * @param user user details
   * @param comment comment obj to be created
   * @returns {true} if comment is created successfully
   */
  async createComment(user: any, comment: Partial<IComment>): Promise<any> {
    try {
      const commentObj = {
        userId: user._id,
        ...comment,
        likes: 0,
        type: comment?.type ?? ECommentType.COMMENT,
        parentId:
          comment?.type == ECommentType.COMMENT ? null : comment.parentId,
      };
      await Promise.all([
        CommentTable.create(commentObj),
        PostTable.findOneAndUpdate(
          { _id: comment.postId },
          { $inc: { comments: 1 } },
          { upsert: true }
        ),
        commentObj.parentId
          ? CommentTable.findByIdAndUpdate(commentObj.parentId, {
              $inc: { replies: 1 },
            })
          : null,
      ]);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Delete a comment
   * @param commentId comment id
   * @returns {true} if comment is deleted successfully
   */
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const comment = await CommentTable.findById({
        _id: new ObjectId(commentId),
      });
      if (comment) {
        await Promise.all([
          CommentTable.findOneAndDelete({ _id: commentId }),
          PostTable.findOneAndUpdate(
            { _id: comment.postId },
            { $inc: { comments: -1 } }
          ),
          comment.parentId
            ? CommentTable.findByIdAndUpdate(comment.parentId, {
                $inc: { replies: -1 },
              })
            : null,
        ]);
      }
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get all comments on a post
   * @param postId
   * @returns {*} List of comments
   */
  async getCommentByPostId(postId: string): Promise<any> {
    try {
      const comments = await CommentTable.find({
        postId,
        type: ECommentType.COMMENT,
      })
        .lean()
        .populate("userId");
      return comments;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get comment by commentId with sorting and proper formatting logic
   * @param commentId
   * @returns {*} Hierarchical comment tree structure
   */
  async getCommentById(commentId: string): Promise<any> {
    try {
      const comments = await CommentTable.aggregate([
        // Match the root comment
        {
          $match: {
            _id: new ObjectId(commentId),
          },
        },

        // First lookup to get all nested comments
        {
          $graphLookup: {
            from: "comments",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parentId",
            as: "allChildren",
            depthField: "depth",
          },
        },

        // Sort all children by depth to ensure proper ordering
        {
          $addFields: {
            allChildren: {
              $sortArray: {
                input: "$allChildren",
                sortBy: { depth: 1 },
              },
            },
          },
        },

        // Lookup user details for the root comment
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },

        // Unwind and add user details to root comment
        {
          $addFields: {
            userDetails: { $arrayElemAt: ["$userDetails", 0] },
          },
        },

        // Unwind allChildren to process each child separately
        {
          $unwind: {
            path: "$allChildren",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup user details for each child comment
        {
          $lookup: {
            from: "users",
            localField: "allChildren.userId",
            foreignField: "_id",
            as: "allChildren.userDetails",
          },
        },

        // Simplify the user details array to a single object
        {
          $addFields: {
            "allChildren.userId": {
              $arrayElemAt: ["$allChildren.userDetails", 0],
            },
          },
        },

        // Group everything back together
        {
          $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            postId: { $first: "$postId" },
            parentId: { $first: "$parentId" },
            content: { $first: "$content" },
            type: { $first: "$type" },
            likes: { $first: "$likes" },
            userDetails: { $first: "$userDetails" },
            childComments: {
              $push: {
                $cond: [
                  { $ifNull: ["$allChildren._id", false] },
                  "$allChildren",
                  "$$REMOVE",
                ],
              },
            },
          },
        },

        // Project final structure
        {
          $project: {
            _id: 1,
            userId: 1,
            postId: 1,
            parentId: 1,
            content: 1,
            type: 1,
            likes: 1,
            userDetails: 1,
            childComments: 1,
          },
        },
      ]).exec();

      // If no comments found, return null
      if (!comments.length) return null;

      // Helper function to build the comment tree
      function buildCommentTree(comment: any, allComments: any) {
        const children = allComments.filter(
          (c: any) =>
            c.parentId && c.parentId.toString() === comment._id.toString()
        );

        return {
          ...comment,
          childComments: children.map((child: any) =>
            buildCommentTree(child, allComments)
          ),
        };
      }

      // Get the root comment and all its children
      const rootComment = comments[0];
      const result = buildCommentTree(
        {
          _id: rootComment._id,
          userId: rootComment.userId,
          postId: rootComment.postId,
          parentId: rootComment.parentId,
          content: rootComment.content,
          type: rootComment.type,
          likes: rootComment.likes,
        },
        rootComment.childComments
      );

      return result;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get commentS by commentId without sorting and a bit different formatting logic
   * @param commentId
   * @returns {*} Hierarchical comment tree structure
   */
  async _getCommentById(commentId: string): Promise<any> {
    try {
      const comments = await CommentTable.aggregate([
        // Match the root comment
        {
          $match: {
            _id: new ObjectId(commentId),
          },
        },

        // Recursive lookup to get all nested comments
        {
          $graphLookup: {
            from: "comments",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "parentId",
            as: "allDescendants",
            depthField: "depth",
            maxDepth: 5, // Optional: to limit the depth of recursion (adjust as necessary)
          },
        },

        // Combine root comment with descendants
        {
          $addFields: {
            allComments: {
              $concatArrays: [["$$ROOT"], "$allDescendants"],
            },
          },
        },

        // Return the complete array of comments (root + descendants)
        {
          $project: {
            _id: 0, // Exclude the root document's _id field
            comments: "$allComments", // Return the combined comments
          },
        },
      ]).exec();

      // After the query finishes, process the data in JavaScript to build the tree structure

      const buildTree = (comments: any) => {
        const commentMap: any = {};
        const rootComments: any = [];

        // Step 1: Create a map of comments by their _id for quick lookup
        comments.forEach((comment: any) => {
          commentMap[comment._id] = { ...comment, childComments: [] };
        });

        // Step 2: Group comments by their parentId
        comments.forEach((comment: any) => {
          if (comment.parentId === null) {
            // Root comments
            rootComments.push(commentMap[comment._id]);
          } else {
            // Nested comments, push them to the parent's childComments
            const parentComment = commentMap[comment.parentId];
            if (parentComment) {
              parentComment.childComments.push(commentMap[comment._id]);
            }
          }
        });

        return rootComments; // Return the root comments with their child hierarchy
      };

      // Build the hierarchical tree structure
      const hierarchicalComments = buildTree(comments[0].comments);

      return hierarchicalComments;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get all comments by userId
   * @param userId
   * @returns {*} List of comments
   */
  async getAllCommentsByUserId(userId: string): Promise<any> {
    try {
      const comments = await CommentTable.find({ user: userId }).lean();
      return comments;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Like or Dislike a comment
   * @param commentId
   * @param userId
   * @param like Boolean - if like or dislike a comment
   * @returns {*} void
   */
  async likeDislikeAComment(
    commentId: string,
    userId: string,
    like: boolean = true
  ): Promise<any> {
    try {
      const comment = await CommentTable.findByIdAndUpdate(commentId).lean();
      if (
        like &&
        comment?.likedBy?.filter((user) => user.toString() == userId)?.length
      ) {
        return null;
      } else if (
        !like &&
        !comment?.likedBy?.filter((user) => user.toString() == userId)?.length
      ) {
        return null;
      }
      let query = {};
      if (like) {
        query = { $inc: { likes: 1 }, $push: { likedBy: userId } };
      } else {
        query = { $inc: { likes: -1 }, $pull: { likedBy: userId } };
      }
      const updatedComment = await CommentTable.findByIdAndUpdate(
        commentId,
        query,
        { upsert: true, new: true }
      ).lean();
      return updatedComment;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new CommentService();
