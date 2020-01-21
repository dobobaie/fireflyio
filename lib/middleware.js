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

  async newRequest(method, data)
  {
    const route = this.modules.route.retrieveRoute(method, data.location);
    if (!route) {
      return this.modules.response.retrieveError(data.uuid, '404');
    }
    const ctx = {
      location: data.location,
      method: method,
      route: route.route_analyse,
      query: route.query,
      params: route.params,
      request: {
        headers: data.headers,
        body: data.body
      }
    };
    await Promise.map(
      [...this.middlewares, ...route.route.middlewares],
      middleware =>
        new Promise(async resolve => {
          let promiseSolved = false;
          await middleware(ctx, () => {
            promiseSolved = true;
            resolve();
          });
          if (!promiseSolved) {
            resolve();
          }
        })
    );
    return this.modules.response.retrieve(data.uuid, ctx);
  }

  push(middleware) {
    this.middlewares.push(middleware);
  }
};
