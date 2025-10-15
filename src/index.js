import {BaaSClient} from "./client.js";
import {authModule} from "./modules/auth.js";
import {dbModule} from "./modules/db.js";
import {apiModule} from "./modules/api.js";

export function createClient(config) {
    const client = new BaaSClient(config);

    return {
        setToken: (token) => client.setToken(token),
        auth: authModule(client),
        db: dbModule(client),
        api: apiModule(client)
        // 未来可以扩展 db, storage, etc.
    };
}