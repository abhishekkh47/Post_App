import { IUser } from "types";
import { AuthService } from "services";
import { getJwtToken, getRefereshToken } from "utils";

class TokenService {
  generateToken(user: IUser) {
    const authInfo = AuthService.getJwtAuthInfo(user);
    const refreshToken = getRefereshToken(authInfo);
    const token = getJwtToken(authInfo);
    return { token, refreshToken };
  }
}

export default new TokenService();
