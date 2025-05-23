import { NetworkError } from "middleware";
import { UserTable } from "models";
import { IUserSignup, IUser } from "types";
import { TokenService, UserService } from "services";
import { verifyPassword, getHashedPassword, decodeJwtToken } from "utils";

class AuthService {
  async findUserByEmail(email: string) {
    return await UserTable.findOne({ email }).lean().select({
      email: 1,
      password: 1,
      firstName: 1,
      lastName: 1,
      bio: 1,
      profile_pic: 1,
      isPrivate: 1,
      posts: 1,
      followers: 1,
      following: 1,
      gender: 1,
      contact: 1,
      resetPasswordToken: 1,
    });
  }

  async findUserById(_id: string) {
    return await UserTable.findOne({ _id }).lean().select({
      email: 1,
      firstName: 1,
      lastName: 1,
      bio: 1,
      profile_pic: 1,
      isPrivate: 1,
      posts: 1,
      followers: 1,
      following: 1,
    });
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
      const user = await UserTable.create({
        ...body,
      });
      if (user) {
        UserService.sendResetLink(user);
      }
      return { user };
    } catch (error) {
      console.log("Err : ", error);
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
