import { UserCore } from "@timeless/biz";

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
  client,
);

// user.walk = () => {

// };
