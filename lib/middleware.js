const Promise = require('bluebird');

const { Debug } = require('./utils');

module.exports = class Middleware
{
  constructor(options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.middlewares = [];
    this.modules = modules;
  }

  _executeMiddleware(ctx, middleware, request) {
    let middlewarePromiseSolved = false;
    return new Promise(async resolve => {
      await middleware(ctx, async () => {
        middlewarePromiseSolved = true;
        resolve(false);
        await request;
      });
      if (!middlewarePromiseSolved) {
        resolve(true);
      }
    })
  }

  _executeMiddlewares(uuid, ctx, middlewares) {
    let middlewaresPromiseSolved = false;
    const request = new Promise(async resolve => {
      await Promise.map(
        [...this.middlewares, ...middlewares],
        middleware =>
          this._executeMiddleware(ctx, middleware, request)
            .then(mustReturnResponse => {
              if (mustReturnResponse) {
                middlewaresPromiseSolved = true;
                const response = this.modules.response.retrieve(uuid, ctx);
                resolve(response);
              }
            })
      );
      if (!middlewaresPromiseSolved) {
        const response = this.modules.response.retrieve(uuid, ctx);
        resolve(response);
      }
    });
    return request;
  }

  newRequest(method, data)
  {
    const route = this.modules.route.retrieveRoute(method, data.location);
    if (!route) {
      return this.modules.response.retrieveError(data.uuid, '404');
    }
    const ctx = {
      url: data.location,
      method: method,
      route: route.route_analyse,
      query: route.query,
      params: route.params,
      request: {
        headers: data.headers,
        body: data.body
      }
    };
    return this._executeMiddlewares(data.uuid, ctx, route.route.middlewares);
  }

  push(middleware) {
    this.middlewares.push(middleware);
  }
};
