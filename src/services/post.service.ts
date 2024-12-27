import { NetworkError } from "middleware/errorHandler.middleware";
import { PostTable } from "models";
import { IBase, ICreatePost } from "types";

class PostService {
  /**
   * @description create post
   * @param postDeatils post details
   * @returns {true}
   */
  public async createPost(postDeatils: ICreatePost) {
    try {
      await PostTable.create(postDeatils);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description get all posts create by a user
   * @param userId
   * @returns {posts} list of posts
   */
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

  /**
   * @description get post details for the given post
   * @param postId
   * @returns {post} post details
   */
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

  /**
   * @description delete the given post of the logged user
   * @param user
   * @param postId post to be deleted
   */
  public async deleteUserPost(user: any, postId: any) {
    try {
      await PostTable.findOneAndDelete({
        _id: postId,
        userId: user?._id,
      }).lean();
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new PostService();
