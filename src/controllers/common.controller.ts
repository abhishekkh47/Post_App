import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { ERR_MSGS } from "utils";
import { AuthService, GroupService } from "services";
import { IUser } from "types";

class CommonController extends BaseController {
  async uploadFileInChat(req: any, res: Response, next: NextFunction) {
    try {
      const {
        params: { chatId },
        files,
      } = req;
      let filename: string[] = [];
      for (let file of files) {
        filename.push(file?.filename);
        if (!filename) {
          return this.BadRequest(res, "Upload a valid file");
        }
      }
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      this.Ok(res, { message: "success", filename });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new CommonController();
