const Promise = require('bluebird');
const server = require('http').createServer();
const io = require('socket.io')(server);

const { probaRouteMatch, routeAnalysis } = require('./utils');

const defaultOptions = {
  debug: false
};

module.exports = class $fireflyio
{
  constructor(custom_options) {
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.middlewares = [];
    this.routes = {};
    this.io = io;
    this.server = server;
    this._ioEvents();
  }

  _ioEvents() {
    this.io.on('connection', client =>
    {
      console.log('io: new connection');

      ['GET', 'DELETE', 'POST', 'PUT'].map(method =>
        client.on(method, data =>
          this._processEvent(client, method, data)
        )
      );

      client.on('disconnect', () => {
        console.log('io: disconnect');
      });
    });
  }

  _setResponse(client, uuid, ctx) {
    client.emit('GET', {
      uuid,
      response: {
        code: 200
      },
      headers: ctx.headers,
      body: ctx.body
    });
  }
  
  _setResponseError(client, uuid, error) {
    let response = null;
    switch (error)
    {
      case '404':
        response = {
          error: 'Not Found',
          code: parseInt(error, 10) || 500
        };
        break;
      case '500':
      default:
        response = {
          error: 'Internal Server Error',
          code: parseInt(error, 10) || 500
        };
    }
    client.emit('GET', { uuid, response });
  }

  _retrieveRouteMatch(method, route) {
    const query_routes = route.split('?');
    const routes = query_routes.shift().split('/');
    const total_routes = routes.length;
    const query = query_routes.join('&');
    const available_routes = Object.keys(this.routes);
    const routes_matched = available_routes.reduce((matched, route, index) => {
      const local_routes = route.split('/');
      const route_method = local_routes.shift();
      if (
        method !== route_method
        || total_routes !== this.routes[route].route_analyse.total_routes
      ) {
        return matched;
      }
      const infos_routes_matched = probaRouteMatch(local_routes, routes);
      if (infos_routes_matched.error) {
        return matched;
      }
      matched.push({
        index,
        infos: infos_routes_matched
      });
      return matched;
    }, []);
    const routes_matched_sorted = routes_matched.sort((a, b) =>
      a.infos.exactMatch - b.infos.exactMatch
    );
    // retrieve params :id ect...
    const route_matched = routes_matched_sorted.shift();
    if (route_matched) {
      const static_route = available_routes[route_matched.index];
      return this.routes[static_route];
    }
    return this.routes[method + '*']
      ? this.routes[method + '*']
      : undefined;
  }

  async _processEvent(client, method, data) {
    const route = this._retrieveRouteMatch(method, data.location);
    if (!route) {
      return this._setResponseError(client, data.uuid, '404');
    }
    const ctx = {
      location: data.location,
      method: method,
      route: route.route_analyse,
      req: {
        headers: data.headers,
        body: data.body
      }
    };
    // middlewares
    await Promise.map(route.middlewares, middleware =>
      middleware(ctx)
    );
    this._setResponse(client, data.uuid, ctx);
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  };

  _pushRoute(method, route, ...middlewares) {
    const route_analyse = routeAnalysis(route);
    this.routes[method + route_analyse.route_cleaned] = {
      method,
      route_analyse,
      middlewares: [...middlewares]
    };
    return this;
  };

  get(...args) {
    return this._pushRoute('GET', args.shift(), ...args);
  };
  
  delete(...args) {
    return this._pushRoute('DELETE', args.shift(), ...args);
  };
  
  post(...args) {
    return this._pushRoute('POST', args.shift(), ...args);
  };
  
  put(...args) {
    return this._pushRoute('PUT', args.shift(), ...args);
  };

  any(...args) {
    return this.get(...args)
      .delete(...args)
      .post(...args)
      .put(...args);
  }
  
  async listen(port) {
    return new Promise((resolve, reject) =>
     this.server.listen(port, (err) => {
        if (err) return reject(err);
        resolve();
      })
    );
  };
};
