# [BETA] fireflyio
Expressive Socket middleware framework for node.js to make web applications and APIs like a real HTTP middleware framework.

## ☁️ Installation

```
$ unavaible
```

## 👋 Hello fireflyio  

``` js
const Fireflyio = require('fireflyio');
const app = new Fireflyio();
 
// response
app.use(ctx => {
  ctx.body = 'Hello Fireflyio';
});
 
app.listen(3000);
```

## ⚙️ Middleware

Fireflyio is a middleware framework that can take two different kinds of functions as middleware:

  * async function
  * common function

Here is an example of logger middleware with each of the different functions:

### ___async___ functions (node v7.6+)

```js
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
```

### Common function

```js
// Middleware normally takes two parameters (ctx, next), ctx is the context for one request,
// next is a function that is invoked to execute the downstream middleware. It returns a Promise with a then function for running code after completion.

app.use((ctx, next) => {
  const start = Date.now();
  return next().then(() => {
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
});
```
## 📝 Methods

### `get` method

`ctx.body` is used to return the body response to the client.

```js
app.get('/hello', middleware, ctx => {
  ctx.body = 'hello'; // return body
});
```

### `delete` method

`ctx.params.userId` is the parameter find in the query url.  

```js
app.delete('/users/:userId', middleware, ctx => {
  ctx.body = `User ${ctx.params.userId} has been deleted`; // return body
});
```

### `post` method

`ctx.request.body` is the request body sent by the client.  

```js
app.post('/users', middleware, ctx => {
  ctx.body = `User ${ctx.request.body.username} has been added`;
});
```

### `put` method

`ctx.status` and `ctx.errorMessage` are return in the response field.  

```js
app.put('/users/:userId', middleware, ctx => {
  ctx.body = {
    error: 'User not found'
  };
  ctx.status = 404;
  ctx.errorMessage = 'User not found'; // same that body way but in response field
});
```

### `any` method

Register `/default` in all the methods.  

```js
app.any('/default', middleware, ctx => {
  ctx.body = 'hello'; // return body
});
```

## 💻 Modules extension

### `extend(module: any, options: object)` 

Add the module in `fireflyio`.  

```js
const Fireflyio = require('fireflyio');
const FireflyioMonitoring = require('fireflyio-monitoring');

const app = new Fireflyio();

const options = {};
app.extend(FireflyioMonitoring, options);

// ...
```

## ⚙️ Options 

`const app = new Fireflyio(options: object);`   

Name parameter | Type | Default | Description
--- | --- | --- | ---
debug | `boolean` | `false` | Enable debug mode
https | `boolean` | `false` | Enable HTTPS mode
server | `object` | `undefined` | [HTTP](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener) or [HTTPS](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) configuration
socket | `object` | `undefined` | [Socket.io](https://www.npmjs.com/package/socket.io) configuration

## 👥 Contributing

Please help us to improve the project by contributing :)  

## ❓️ Testing

```
$ npm install
$ npm test
```
