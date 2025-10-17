# BaaS JS - 前端快速使用手册

## 📦 安装

```bash
npm install baas_js

yarn add baas_js
```

## 🚀 5分钟快速上手

### 1. 初始化客户端

```javascript
import { createClient } from 'baas_js';

// 在项目入口文件（如 main.js 或 App.vue）中初始化
const client = createClient({
  baseUrl: 'https://your-api.example.com',  // 你的后端地址
  apiKey: 'YOUR_API_KEY'                     // 你的 API Key
});

// 导出供全局使用
export default client;
```

### 2. 用户认证

#### 登录

```javascript
// 支持三种登录方式：手机号、邮箱、用户名
await client.auth.login({
  phone: '13800000000',
  password: '123456'
});

// 或使用邮箱
await client.auth.login({
  email: 'user@example.com',
  password: '123456'
});

// 或使用用户名
await client.auth.login({
  user_name: 'john_doe',
  password: '123456'
});
```

#### 注册

```javascript
await client.auth.register({
  user_name: 'john_doe',
  phone: '13800000000',
  email: 'john@example.com',
  password: '123456',
  // 其他自定义字段...
});
```

#### 获取当前用户信息

```javascript
const userInfo = await client.auth.getUser();
console.log(userInfo);
```

#### 登出

```javascript
await client.auth.logout();
```

### 3. 数据库操作（重点！）

#### 查询数据

```javascript
// 获取列表
const todos = await client.db
  .from('todos')
  .list();

// 带条件查询
const openTodos = await client.db
  .from('todos')
  .list()
  .eq('status', 'open')              // status = 'open'
  .order('created_at', 'desc');      // 按创建时间倒序

// 分页查询
const page1 = await client.db
  .from('products')
  .list()
  .page(1, 10);  // 第1页，每页10条

// 获取单条数据
const todo = await client.db
  .from('todos')
  .get()
  .eq('id', 123);
```

#### 高级查询

```javascript
// 大于、小于
const expensiveProducts = await client.db
  .from('products')
  .list()
  .gt('price', 100)    // price > 100
  .lt('price', 500);   // price < 500

// IN 查询
const items = await client.db
  .from('orders')
  .list()
  .in('status', ['paid', 'shipped', 'delivered']);

// BETWEEN 查询
const recentOrders = await client.db
  .from('orders')
  .list()
  .between('created_at', ['2025-01-01', '2025-12-31']);

// OR 条件（优惠订单：金额小于100 或 有折扣）
const discountedOrders = await client.db
  .from('orders')
  .list()
  .or(q => 
    q.lt('amount', 100)
     .gt('discount', 0)
  );

// 复杂查询示例
const results = await client.db
  .from('products')
  .list()
  .eq('category', 'electronics')
  .gt('rating', 4.0)
  .or(q => q.lt('price', 50).eq('on_sale', true))
  .order('price', 'asc')
  .page(1, 20);
```

#### 插入数据

```javascript
const newTodo = await client.db
  .from('todos')
  .insert()
  .values({
    title: '买牛奶',
    status: 'open',
    created_at: new Date().toISOString()
  });
```

#### 更新数据

```javascript
// 更新指定 ID 的数据
const updated = await client.db
  .from('todos')
  .update()
  .set({ status: 'closed' })
  .eq('id', 123);

// 批量更新
const batchUpdated = await client.db
  .from('orders')
  .update()
  .set({ status: 'cancelled' })
  .lt('created_at', '2024-01-01');  // 更新2024年之前的订单
```

#### 删除数据

```javascript
// 删除指定 ID
await client.db
  .from('todos')
  .delete()
  .eq('id', 123);

// 批量删除
await client.db
  .from('logs')
  .delete()
  .lt('created_at', '2024-01-01');  // 删除旧日志
```

### 4. 调用自定义 API

```javascript
// 简单调用
const result = await client.api
  .call('send_sms')
  .param('phone', '13800000000')
  .param('code', '123456');

// 传递多个参数
const data = await client.api
  .call('send_email')
  .params({
    to: 'user@example.com',
    subject: '欢迎注册',
    content: '感谢您的注册！'
  });

// 添加自定义请求头
const response = await client.api
  .call('process_payment')
  .params({
    order_id: '12345',
    amount: 99.99
  })
  .header('X-Request-Id', 'req-001')
  .headers({
    'X-Trace-Id': 'trace-001',
    'X-Client-Version': '1.0.0'
  });
```

## 🎯 常见业务场景

### 场景1：带搜索的商品列表

```javascript
// 搜索组件
async function searchProducts(keyword, category, page = 1) {
  const query = client.db
    .from('products')
    .list()
    .page(page, 20);
  
  if (category) {
    query.eq('category', category);
  }
  
  // 假设后端支持关键词搜索
  if (keyword) {
    query.eq('name', keyword);  // 实际可能需要后端支持模糊搜索
  }
  
  return await query.order('created_at', 'desc');
}

// 使用
const products = await searchProducts('手机', 'electronics', 1);
```

### 场景2：用户购物车

```javascript
// 添加到购物车
async function addToCart(productId, quantity) {
  return await client.db
    .from('cart_items')
    .insert()
    .values({
      product_id: productId,
      quantity: quantity,
      added_at: new Date().toISOString()
    });
}

// 获取购物车列表
async function getCartItems() {
  return await client.db
    .from('cart_items')
    .list()
    .order('added_at', 'desc');
}

// 更新购物车数量
async function updateCartQuantity(cartItemId, quantity) {
  return await client.db
    .from('cart_items')
    .update()
    .set({ quantity })
    .eq('id', cartItemId);
}

// 清空购物车
async function clearCart() {
  const items = await getCartItems();
  for (const item of items.data) {
    await client.db
      .from('cart_items')
      .delete()
      .eq('id', item.id);
  }
}
```

### 场景3：订单管理

```javascript
// 创建订单
async function createOrder(orderData) {
  return await client.db
    .from('orders')
    .insert()
    .values({
      ...orderData,
      status: 'pending',
      created_at: new Date().toISOString()
    });
}

// 获取我的订单（带筛选）
async function getMyOrders(status = null, page = 1) {
  const query = client.db
    .from('orders')
    .list()
    .page(page, 10);
  
  if (status) {
    query.eq('status', status);
  }
  
  return await query.order('created_at', 'desc');
}

// 取消订单
async function cancelOrder(orderId) {
  return await client.db
    .from('orders')
    .update()
    .set({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', orderId);
}
```

## 💡 最佳实践

### 1. 封装 API 调用

建议创建一个 `api` 目录，将所有业务逻辑封装：

```javascript
// api/user.js
import client from './client';

export const userApi = {
  async login(credentials) {
    return await client.auth.login(credentials);
  },
  
  async register(userData) {
    return await client.auth.register(userData);
  },
  
  async getProfile() {
    return await client.auth.getUser();
  },
  
  async logout() {
    return await client.auth.logout();
  }
};

// api/products.js
import client from './client';

export const productApi = {
  async getList(filters = {}) {
    const query = client.db.from('products').list();
    
    if (filters.category) {
      query.eq('category', filters.category);
    }
    if (filters.minPrice) {
      query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query.lte('price', filters.maxPrice);
    }
    
    return await query
      .order('created_at', 'desc')
      .page(filters.page || 1, filters.pageSize || 20);
  },
  
  async getById(id) {
    return await client.db
      .from('products')
      .get()
      .eq('id', id);
  }
};
```

### 2. 错误处理

```javascript
async function safeApiCall(apiFunction) {
  try {
    const response = await apiFunction();
    
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { 
        success: false, 
        error: response.message || '操作失败' 
      };
    }
  } catch (error) {
    console.error('API调用失败:', error);
    return { 
      success: false, 
      error: error.message || '网络错误，请稍后重试' 
    };
  }
}

// 使用示例
const result = await safeApiCall(() => 
  client.db.from('products').list()
);

if (result.success) {
  console.log('数据:', result.data);
} else {
  alert(result.error);
}
```

### 3. 在 Vue 3 中使用

```javascript
// plugins/baas.js
import { createClient } from 'baas_js';

export default {
  install(app, options) {
    const client = createClient({
      baseUrl: options.baseUrl,
      apiKey: options.apiKey
    });
    
    app.config.globalProperties.$baas = client;
    app.provide('baas', client);
  }
};

// main.js
import { createApp } from 'vue';
import App from './App.vue';
import baasPlugin from './plugins/baas';

const app = createApp(App);

app.use(baasPlugin, {
  baseUrl: 'https://your-api.example.com',
  apiKey: 'YOUR_API_KEY'
});

app.mount('#app');

// 在组件中使用
// <script setup>
import { inject } from 'vue';

const baas = inject('baas');

async function loadData() {
  const products = await baas.db.from('products').list();
  console.log(products);
}
// </script>
```

### 4. 在 React 中使用

```javascript
// hooks/useBaas.js
import { createClient } from 'baas_js';

const client = createClient({
  baseUrl: 'https://your-api.example.com',
  apiKey: 'YOUR_API_KEY'
});

export function useBaas() {
  return client;
}

// 组件中使用
import { useState, useEffect } from 'react';
import { useBaas } from './hooks/useBaas';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const baas = useBaas();
  
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await baas.db
          .from('products')
          .list()
          .order('created_at', 'desc');
        
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('加载失败:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, []);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

## 🔑 核心概念

### 链式调用

所有数据库操作都支持链式调用，最后 `await` 即可：

```javascript
const result = await client.db
  .from('table')
  .list()
  .eq('field', 'value')
  .order('date', 'desc')
  .page(1, 10);
```

### 自动 Token 管理

- 登录后，SDK 自动将 token 存储到 `localStorage`（key: `baas_token`）
- 后续所有请求自动在 Header 中携带 `Authorization: Bearer <token>`
- 无需手动管理 token

### 请求头

所有请求自动包含：
- `Content-Type: application/json`
- `CODE_FLYING: <apiKey>`（你配置的 API Key）
- `Authorization: Bearer <token>`（登录后自动添加）

## 📚 过滤器完整列表

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq(field, value)` | 等于 | `.eq('status', 'active')` |
| `neq(field, value)` | 不等于 | `.neq('deleted', true)` |
| `gt(field, value)` | 大于 | `.gt('age', 18)` |
| `gte(field, value)` | 大于等于 | `.gte('score', 60)` |
| `lt(field, value)` | 小于 | `.lt('price', 100)` |
| `lte(field, value)` | 小于等于 | `.lte('stock', 10)` |
| `in(field, array)` | 在数组中 | `.in('category', ['A', 'B'])` |
| `between(field, [min, max])` | 在区间内 | `.between('date', ['2025-01-01', '2025-12-31'])` |
| `or(callback)` | OR 条件 | `.or(q => q.eq('a', 1).eq('b', 2))` |
| `order(field, dir)` | 排序 | `.order('created_at', 'desc')` |
| `page(num, size)` | 分页 | `.page(1, 20)` |

## ❓ 常见问题

### Q: Token 过期怎么办？
A: 后端返回 401 时，前端需要清除 token 并重新登录：

```javascript
try {
  const data = await client.db.from('products').list();
} catch (error) {
  if (error.status === 401) {
    await client.auth.logout();
    // 跳转到登录页
    window.location.href = '/login';
  }
}
```

### Q: 如何判断用户是否已登录？
A: 检查 localStorage 中的 token：

```javascript
function isLoggedIn() {
  return !!localStorage.getItem('baas_token');
}
```

### Q: 支持文件上传吗？
A: 当前版本不直接支持，需要通过自定义 API 实现：

```javascript
// 假设后端有文件上传 API
const formData = new FormData();
formData.append('file', fileObject);

// 需要使用原生 fetch
const response = await fetch(`${baseUrl}/api/upload`, {
  method: 'POST',
  headers: {
    'CODE_FLYING': apiKey,
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Q: 在 Node.js 环境中使用？
A: SDK 依赖 `fetch` 和 `localStorage`，Node.js 环境需要 polyfill：

```javascript
// 安装依赖
npm install node-fetch node-localstorage

// 使用
global.fetch = require('node-fetch');
const { LocalStorage } = require('node-localstorage');
global.localStorage = new LocalStorage('./scratch');

const { createClient } = require('baas_js');
const client = createClient({ baseUrl: '...', apiKey: '...' });
```

## 🎉 快速参考卡片

```javascript
// 初始化
const client = createClient({ baseUrl: '...', apiKey: '...' });

// 认证
await client.auth.login({ phone: '...', password: '...' });
await client.auth.register({ ... });
await client.auth.getUser();
await client.auth.logout();

// 查询
await client.db.from('table').list();
await client.db.from('table').get().eq('id', 1);

// 增删改
await client.db.from('table').insert().values({ ... });
await client.db.from('table').update().set({ ... }).eq('id', 1);
await client.db.from('table').delete().eq('id', 1);

// 自定义 API
await client.api.call('api_name').params({ ... });
```

---

🚀 现在你已经掌握了 BaaS JS 的核心用法，开始构建你的应用吧！

有问题？查看完整文档：[README.md](./README.md)

