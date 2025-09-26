export function authModule(client) {
    return {
        async login(email, password) {
            return client.request("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
        },

        async logout() {
            return client.request("/auth/logout", { method: "POST" });
        }
    };
}
