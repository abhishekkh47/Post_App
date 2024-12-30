import { IUser } from "types";
import { AuthService } from "services";
import { getJwtToken, getRefereshToken } from "utils";

class TokenService {
  /**
   * @description Generate auth token and refresh token
   * @param user user object
   * @returns {token, refreshToken}
   */
  generateToken(user: IUser): any {
    const authInfo = AuthService.getJwtAuthInfo(user);
    const refreshToken = getRefereshToken(authInfo);
    const token = getJwtToken(authInfo);
    return { token, refreshToken };
  }
}

export default new TokenService();
