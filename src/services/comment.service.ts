import { CommentTable } from "models/comments";
import { NetworkError } from "middleware";
import type { IComment } from "types/comment";
import { ECommentType } from "types/comment";
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
      };
      await CommentTable.create(commentObj);
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
      await CommentTable.findOneAndDelete({ _id: commentId });
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
      const comments = await CommentTable.find({ postId }).lean();
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
            allChildren: 1,
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
        rootComment.allChildren
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
}

export default new CommentService();
