import axios, { AxiosError } from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT = 10000; // 10 seconds

export class AIService {
  private isServiceAvailable: boolean = true;

  /**
   * Check if AI service is available
   */
  private async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, {
        timeout: 3000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user recommendations based on profile similarity
   */
  async getUserRecommendations(userId: string, limit: number = 10, excludeFollowing: boolean = true) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/recommendations/users`,
        {
          user_id: userId,
          limit,
          exclude_following: excludeFollowing
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      if (error instanceof AxiosError && error.code === 'ECONNREFUSED') {
        this.isServiceAvailable = false;
      }
      return null;
    }
  }

  /**
   * Get post recommendations for user's feed
   */
  async getPostRecommendations(userId: string, limit: number = 20, page: number = 1) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/recommendations/posts`,
        {
          user_id: userId,
          limit,
          page
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting post recommendations:', error);
      return null;
    }
  }

  /**
   * Get collaborative post recommendations (based on similar users)
   */
  async getCollaborativePostRecommendations(userId: string, limit: number = 20, page: number = 1) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/recommendations/posts/collaborative`,
        {
          user_id: userId,
          limit,
          page
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return null;
    }
  }

  /**
   * Semantic search for posts
   */
  async searchPosts(query: string, limit: number = 20) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/search/posts`,
        {
          query,
          limit,
          search_type: 'posts'
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      return null;
    }
  }

  /**
   * Semantic search for users
   */
  async searchUsers(query: string, limit: number = 10) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/search/users`,
        {
          query,
          limit,
          search_type: 'users'
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      return null;
    }
  }

  /**
   * Check content for toxicity and spam
   */
  async moderateContent(text: string, checkToxicity: boolean = true, checkSpam: boolean = true) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/moderation/check`,
        {
          text,
          check_toxicity: checkToxicity,
          check_spam: checkSpam
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error moderating content:', error);
      // If moderation fails, allow content by default (fail open)
      return {
        is_safe: true,
        toxicity_score: 0,
        spam_score: 0,
        categories: {},
        flagged_reasons: []
      };
    }
  }

  /**
   * Check if AI service is currently available
   */
  async isAvailable(): Promise<boolean> {
    return await this.checkServiceHealth();
  }

  /**
   * Generate and store embedding for a new user
   */
  async generateUserEmbedding(userId: string) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/embeddings/user`,
        {
          user_id: userId
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating user embedding:', error);
      return null;
    }
  }

  /**
   * Generate and store embedding for a new post
   */
  async generatePostEmbedding(postId: string) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/embeddings/post`,
        {
          post_id: postId
        },
        { timeout: AI_SERVICE_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating post embedding:', error);
      return null;
    }
  }
}

export default new AIService();