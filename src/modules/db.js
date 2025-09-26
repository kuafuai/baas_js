class QueryBuilder {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this._body = null;
        this._method = "";
    }

    list(params = {}) {
        this._body = params;
        this._method = "list";
        return this.execute();
    }

    async execute() {
        return await this.client.request(`/api/data/invoke?table=${this.table}&method=${this._method}`, {
            method: "POST",
            body: this._body ? JSON.stringify(this._body) : undefined
        });
    }
}

export function dbModule(client) {
    return {
        from(table) {
            return new QueryBuilder(client, table);
        }
    };
}