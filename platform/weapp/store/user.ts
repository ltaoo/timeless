import { UserCore } from "@/biz/user/index";

import { storage } from "./storage";
import { client } from "./http_client";

const { id, username, email, avatar, token } = storage.get("user");

class ExtendsUser extends UserCore {
  say() {
    console.log(`My name is ${this.nickname}`);
  }
}
export const user = new ExtendsUser(
  {
    id,
    username,
    avatar,
    token,
    expires_at: 0,
  },
  client
);

// user.walk = () => {

// };
