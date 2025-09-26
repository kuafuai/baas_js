export class BaaSClient {

    constructor({baseUrl, apiKey}) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.token = localStorage.getItem("baas_token") || null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem("baas_token", token);
        } else {
            localStorage.removeItem("baas_token");
        }
    }

    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            "Content-Type": "application/json",
            "CODE_FLYING": `${this.apiKey}`,
            ...(this.token ? {"Authorization": `Bearer ${this.token}`} : {}),
            ...(options.headers || {})
        };

        const res = await fetch(url, {
            ...options,
            headers,
        });

        return res.json();
    }
}