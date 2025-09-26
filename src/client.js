export class BaaSClient {

    constructor({ baseUrl, apiKey }) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            ...(options.headers || {})
        };

        const res = await fetch(url, {
            ...options,
            headers,
        });

        return res.json();
    }
}