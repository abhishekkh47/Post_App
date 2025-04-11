import { Storage } from "megajs";
import Config from "config";

// Initialize the MEGA storage with your credentials
export const storage = new Storage({
  email: Config.MEGA_EMAIL as string,
  password: Config.MEGA_PASSWORD as string,
});

// Wait for the storage to be ready
// (async () => {
//   await storage.ready;
// })();

export const mega = async () => {
  await storage.ready;
};
