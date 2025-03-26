import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { RequireActiveUser } from "middleware";

class CommonController extends BaseController {
  @RequireActiveUser()
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
      this.Ok(res, { message: "success", filename });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new CommonController();
