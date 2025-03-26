import { AuthService } from "services/index";
import { IUser } from "types/user";
import { ERR_MSGS } from "utils/constants";

export function RequireActiveUser() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req, res, next] = args;

      try {
        const userId = (req as any)._id;
        const user: IUser | null = await AuthService.findUserById(userId);

        if (!user) {
          return res.status(401).json({
            status: 401,
            message: ERR_MSGS.USER_NOT_FOUND,
          });
        }

        (req as any).user = user;
        return await originalMethod.apply(this, args);
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: (error as Error).message || "An unexpected error occurred",
        });
      }
    };

    return descriptor;
  };
}
