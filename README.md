# [BETA] fireflyio

Expressive Socket middleware framework for node.js to make web applications and APIs like a real HTTP middleware framework.

## 🚀 Fireflyio

[Fireflyio server](https://github.com/dobobaie/fireflyio)  
[Fireflyio client](https://github.com/dobobaie/fireflyio-client)  
[Fireflyio module router](https://github.com/dobobaie/fireflyio-router)  
[Fireflyio module monitoring](https://github.com/dobobaie/fireflyio-monitoring)  
[Fireflyio module ui-monitoring](https://github.com/dobobaie/fireflyio-ui-monitoring)  

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

## 📝 Socket

### How it works ?

The module works like a real REST API but the communication is via the socket protocol.   

### `app.socket` 

`app.socket` give you more control about the native socket.

### `app.socket.on(event: string, callback: Function)`

All the events available is bellow :   

Name event | Description
--- | ---
ready | Called when the socket server is ready
newClientConnection | Called for each new client connection
clientDisconnected | Called for each disconnect client

### `app.socket.diffuse(event: string, data: any)`

Emit the specific event for each clients.  

## ⚙️ Options 

`const app = new Fireflyio(options: object);`   

Name parameter | Type | Default | Description
--- | --- | --- | ---
debug | `boolean` | `false` | Enable debug mode
https | `boolean` | `false` | Enable HTTPS mode (same as `ssl`)
ssl | `boolean` | `false` | Enable SSL mode (same as `https`)
allowedHttpRequests | `boolean` | `false` | Allow HTTP(S) requests in the same way that socket requests
blackListHttpRequests | `Array<route: string>` | `[]` | Deny HTTP(S) requests only for those routes
whiteListHttpRequests | `Array<route: string>` | `[]` | Allow HTTP(S) requests only for those routes
server | `object` | `undefined` | [HTTP](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener) or [HTTPS](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) configuration
socket | `object` | `undefined` | [Socket.io](https://www.npmjs.com/package/socket.io) configuration

## 👥 Contributing

Please help us to improve the project by contributing :)  

## ❓️ Testing

```
$ npm install
$ npm test
```
