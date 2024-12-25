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

  async deleteComment(user: any, comment: Partial<IComment>) {
    try {
      const commentObj = {
        userId: user._id,
        ...comment,
        likes: 0,
        type: comment?.type ?? ECommentType.COMMENT,
      };
      await CommentTable.findOneAndDelete(commentObj);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new CommentService();
