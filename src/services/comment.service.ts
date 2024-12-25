import { CommentTable } from "models/comments";
import { NetworkError } from "middleware";
import type { IComment } from "types/comment";
import { ECommentType } from "types/comment";

class CommentService {
  async createComment(user: any, comment: Partial<IComment>) {
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

  async deleteComment(commentId: string) {
    try {
      await CommentTable.findOneAndDelete({ _id: commentId });
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async getCommentByPostId(postId: string) {
    try {
      const comments = await CommentTable.find({ postId }).lean();
      return comments;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async getCommentById(commentId: string) {
    try {
      const comments = await CommentTable.findOne({ _id: commentId }).lean();
      return comments;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new CommentService();
