import { BaaSClient } from "./client.js";
import { authModule } from "./modules/auth.js";

export function createClient(config) {
  const client = new BaaSClient(config);

  return {
    auth: authModule(client),
    // 未来可以扩展 db, storage, etc.
  };
}