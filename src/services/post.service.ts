import { NetworkError } from "middleware/errorHandler.middleware";
import { PostTable, UserTable } from "models";
import { IBase, ICreatePost } from "types";

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
        { _id: 1, userId: 1, post: 1, type: 1, createdAt: 1, edited: 1 }
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
        { _id: 1, post: 1, type: 1, edited: 1 }
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
}

export default new PostService();
