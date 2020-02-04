const Promise = require('bluebird');

const Headers = require('./headers');

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
        middlewares,
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
    const ctx = {
      url,
      method,
      headers: {},
      route,
      query,
      queries,
      params,
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
    if (!this.modules.router) {
      return this.modules.response.retrieveError(data.uuid, '404');
    }

    const route = this.modules.router.modules.route.retrieveRouteDetails(method, data.location);
    if (!route.route) {
      return this.modules.response.retrieveError(data.uuid, '404');
    }
    return this._processRequest(method, route, data);
  }

  push(middleware) {
    if (this.modules.router) {
      this.modules.router.modules.route.pushMiddlewareToAllRoutes(middleware);
    }
    this.middlewares.push(middleware);
  }

  retrieveMiddlewares() {
    return this.middlewares;
  }
};
