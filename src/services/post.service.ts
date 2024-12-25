import { NetworkError } from "middleware/errorHandler.middleware";
import { PostTable } from "models";
import { IBase, ICreatePost } from "types";

class PostService {
  public async createPost(postDeatils: ICreatePost) {
    try {
      await PostTable.create(postDeatils);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  public async getAllPostByUser(
    userId: string
  ): Promise<Array<Partial<IBase>>> {
    try {
      const posts = await PostTable.find(
        { userId: userId },
        { _id: 1, post: 1, type: 1 }
      ).lean();
      return posts;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  public async getPostById(postId: string): Promise<Partial<IBase>> {
    try {
      const post = await PostTable.findById(
        { _id: postId },
        { _id: 1, post: 1, type: 1 }
      ).lean();
      if (!post) {
        throw new NetworkError("Post not found", 400);
      }
      return post;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  public async deleteUserPost(user: any, params: any) {
    try {
      await PostTable.findOneAndDelete({
        _id: params.id,
        userId: user._id,
      }).lean();
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new PostService();
