import { ITokenResponse, IUser } from "types";
import { AuthService } from "services";
import { getJwtToken, getRefereshToken } from "utils";

class TokenService {
  /**
   * @description Generate auth token and refresh token
   * @param user user object
   * @returns {token, refreshToken}
   */
  generateToken(user: IUser): ITokenResponse {
    const authInfo = AuthService.getJwtAuthInfo(user);
    const refreshToken = getRefereshToken(authInfo);
    const token = getJwtToken(authInfo);
    return { token, refreshToken };
  }

  /**
   * @description Generate auth token to reset password
   * @param user user object
   * @returns {token}
   */
  generatePasswordResetToken(user: IUser): string {
    const authInfo = AuthService.getJwtAuthInfo(user);
    const token = getJwtToken(authInfo, 300);
    return token;
  }
}

export default new TokenService();
