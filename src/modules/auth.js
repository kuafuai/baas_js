export function authModule(client) {
    return {
        async login({user_name, phone, email, password} = {}) {
            const account = user_name || phone || email;
            if (!account) {
                throw new Error("必须提供 user_name、phone 或 email 之一");
            }
            if (!password) {
                throw new Error("必须提供 password");
            }
            const res = await client.request("/login/passwd", {
                method: "POST",
                body: JSON.stringify({
                    phone: account,
                    password: password
                })
            });
            if (res.success) {
                client.setToken(res.data);
            }
            return res;
        },

        async getUser(){
            return client.request("/getUserInfo", {method: "GET"});
        },

        async register(data) {
            return await client.request("/login/register", {
                method: "POST",
                body: JSON.stringify(data)
            });
        },

        async logout() {
            client.setToken(null);
            return client.request("/logout", {method: "GET"});
        }
    };
}
