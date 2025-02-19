import { NetworkError } from "middleware";
import { UserTable } from "models";
import { IUserSignup, IUser } from "types";
import { TokenService } from "services";
import { verifyPassword, getHashedPassword, decodeJwtToken } from "utils";

class AuthService {
  async findUserByEmail(email: string) {
    return await UserTable.findOne({ email });
  }

  async findUserById(_id: string) {
    return await UserTable.findOne({ _id });
  }

  getJwtAuthInfo(user: Partial<IUser>) {
    const expiredOn = Date.now() + 36000;

    return {
      _id: user._id,
      issuedOn: Date.now(),
      expiredOn,
      email: user.email,
    };
  }

  async userSignup(body: IUserSignup) {
    try {
      let response = {};
      const hashedPassword = getHashedPassword(body.password);
      const user = await UserTable.create({
        ...body,
        password: hashedPassword,
      });
      if (user) {
        response = TokenService.generateToken(user);
      }
      return { response, user };
    } catch (error) {
      throw new NetworkError("Error occurred while creating a user", 400);
    }
  }

  async userLogin(user: IUser | null, password: string) {
    try {
      let response = null;
      if (!user?.password) {
        throw new NetworkError("Invalid password", 400);
      }
      const ifAuthenticated = verifyPassword(user.password, password);
      if (ifAuthenticated) {
        response = TokenService.generateToken(user);
      }
      return response;
    } catch (error) {
      throw new NetworkError("Error occurred while creating a user", 400);
    }
  }

  async getRefreshToken(token: string) {
    try {
      let response = {},
        user: any;
      try {
        user = decodeJwtToken(token);
      } catch (error) {
        throw new NetworkError("Refresh Token Expired", 400);
      }
      user = await this.findUserById(user._id);
      if (!user) {
        return;
      }
      response = TokenService.generateToken(user);

      return response;
    } catch (error) {
      throw new NetworkError("Error occurred while creating a user", 400);
    }
  }
}

export default new AuthService();
