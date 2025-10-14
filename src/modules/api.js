class ApiBuilder {
    constructor(client, apiName) {
        this.client = client;
        this.apiName = apiName;
        this._params = {};
        this._headers = {};
        this._method = "POST";
    }

    param(key, value) {
        this._params[key] = value;
        return this;
    }

    params(obj) {
        Object.assign(this._params, obj);
        return this;
    }

    header(key, value) {
        this._headers[key] = value;
        return this;
    }

    headers(obj) {
        Object.assign(this._headers, obj);
        return this;
    }

    async _execute() {
        const body = JSON.stringify(this._params);
        const url = `/api/${this.apiName}`;
        return await this.client.request(url, {
            method: this._method,
            headers: this._headers,
            body
        });
    }

    then(resolve, reject) {
        this._execute().then(resolve, reject);
    }

}


export function apiModule(client) {
    return {
        call(apiName) {
            return new ApiBuilder(client, apiName);
        }
    }
}