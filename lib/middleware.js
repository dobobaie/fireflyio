const Promise = require('bluebird');

const Headers = require('./headers');

const { Debug } = require('./utils');

module.exports = class Middleware
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
    this.middlewares = [];
  }
  
  _executeMiddleware(position, ctx) {
    return new Promise(async (resolve, reject) => {
      let nextHasBeenCalled = false;
      try {
        const isSuccess = await this.middlewares[position](ctx, async () => {
          nextHasBeenCalled = true;
          if (this.middlewares[position + 1]) {
            await this._executeMiddleware(position + 1, ctx);
          }
        });
        if (!nextHasBeenCalled && this.middlewares[position + 1]) {
          this._executeMiddleware(position + 1, ctx);
        }
        resolve();
      } catch (err) {
        reject(err); 
      }
    })
  }

  _executeMiddlewares(uuid, ctx) {
    let middlewaresPromiseSolved = false;
    const request = new Promise(async resolve => {
      await this._executeMiddleware(0, ctx);
      const response = this.modules.response.retrieve(uuid, ctx);
      resolve(response);
    });
    return request;
  }
  

  _buildScope({ url, method, headers, body }) {
    const ctx = {
      url,
      method,
      headers: Object.keys(headers).reduce((accumulator, header_key) => {
        accumulator[header_key.toLowerCase()] = headers[header_key];
        return accumulator;
      }, {}), // TO CHANGE
      request: {
        headers,
        body
      }
    };
    
    const _headers = new Headers(ctx);
    ctx.set = (...args) => _headers.set(...args);
    ctx.get = (...args) => _headers.get(...args);

    return ctx;
  }

  newRequest(method, { uuid, location, headers, body })
  {
    const ctx = this._buildScope({
      url: location,
      method,
      headers,
      body
    });
    return this._executeMiddlewares(uuid, ctx);    
  }

  push(middleware) {
    this.middlewares.push(middleware);
  }
};
