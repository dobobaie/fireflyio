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

  _buildScope({ url, method, route, query, queries, params, headers, body }) {
    return {
      url,
      method,
      headers: {}, // ?
      route,
      query,
      queries,
      params,
      request: {
        headers,
        body
      }
    };
  }

  _processRequest(method, { route_analyse, query, queries, params, route }, { uuid, location, headers, body })
  {
    const ctx = this._buildScope({
      url: location,
      method,
      route: route_analyse,
      query,
      queries,
      params,
      headers,
      body
    });
    return this._executeMiddlewares(uuid, ctx, route.middlewares);    
  }

  newRequest(method, data)
  {
    const route = this.modules.route.retrieveRoute(method, data.location);
    if (!route.route) {
      return this.modules.response.retrieveError(data.uuid, '404');
    }
    return this._processRequest(method, route, data);
  }

  push(middleware) {
    this.middlewares.push(middleware);
  }
};
