class QueryBuilder {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this._body = null;
        this._method = "";
    }

    list() {
        return new FilterBuilder(this.client, this.table, 'list')
    }
}

class FilterBuilder {
    constructor(client, table, method) {
        this.client = client;
        this.table = table;
        this.method = method;
        this.filters = {};
    }

    // 内部统一方法
    _addFilter(field, operator, value) {
        if (!this.filters.hasOwnProperty(field)) {
            this.filters[field] = {};
        }
        this.filters[field][operator] = value;
        return this; // 支持链式调用
    }

    // =
    eq(field, value) {
        return this._addFilter(field, "eq", value);
    }

    // !=
    neq(field, value) {
        return this._addFilter(field, "neq", value);
    }

    // >
    gt(field, value) {
        return this._addFilter(field, "gt", value);
    }

    // >=
    gte(field, value) {
        return this._addFilter(field, "gte", value);
    }

    // <
    lt(field, value) {
        return this._addFilter(field, "lt", value);
    }

    // <=
    lte(field, value) {
        return this._addFilter(field, "lte", value);
    }

    // in
    in(field, values) {
        return this._addFilter(field, "in", values);
    }

    // between
    between(field, values) {
        return this._addFilter(field, "between", values);
    }

    // 顶层 or
    or(callback) {
        if (!this.filters.or) {
            this.filters.or = [];
        }

        const subBuilder = new FilterBuilder(this.client, this.table, "or");
        callback(subBuilder);

        this.filters.or.push(subBuilder.build());
        return this;
    }

    limit(count) {
        return this;
    }

    page(number, size) {
        this.filters.current = number;
        this.filters.pageSize = size;
        return this;
    }

    order(field, directionOrOptions = "asc") {
        if (!this.filters.order_by) {
            this.filters.order_by = [];
        }

        let direction = "asc";

        if (typeof directionOrOptions === "string") {
            direction = directionOrOptions.toLowerCase();
        } else if (typeof directionOrOptions === "object" && directionOrOptions !== null) {
            if ("ascending" in directionOrOptions) {
                direction = directionOrOptions.ascending ? "asc" : "desc";
            } else if ("direction" in directionOrOptions) {
                direction = directionOrOptions.direction.toLowerCase();
            }
        }

        this.filters.order_by.push({field, direction});
        return this;
    }

    build() {
        return this.filters;
    }


    async _execute() {
        return await this.client.request(`/api/data/invoke?table=${this.table}&method=${this.method}`, {
            method: "POST",
            body: this.filters ? JSON.stringify(this.filters) : undefined
        });
    }

    then(resolve, reject) {
        this._execute().then(resolve, reject);
    }

}

export function dbModule(client) {
    return {
        from(table) {
            return new QueryBuilder(client, table);
        }
    };
}