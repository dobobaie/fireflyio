const { Debug } = require('./utils');

module.exports = class Route
{
  constructor(options) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.routes = {};
  }

  _probaRouteMatch(route_to_match, routes) {
    return route_to_match
      .reduce((infos, route, index) => {
        if (route[0] === '?') {
          infos.dynamicMatch += 1;
          return infos;
        }
        if (route === routes[index]) {
          infos.exactMatch += 1;
          return infos;
        }
        infos.error = true;
        return infos;
      }, {
        exactMatch: 0,
        dynamicMatch: 0,
        error: false
      });
  }

  _retrieveRoutesMatched(method, route_splited) {
    const total_routes = route_splited.length;
    const available_routes = Object.keys(this.routes);
    return available_routes.reduce((matched, route) => {
      const local_routes = route.split('/');
      const route_method = local_routes.shift();
      const routes_total_routes = this.routes[route].route_analyse.total_routes;
      if (method !== route_method || total_routes !== routes_total_routes) {
        return matched;
      }
      const infos_routes_matched = this._probaRouteMatch(local_routes, route_splited);
      if (infos_routes_matched.error) {
        return matched;
      }
      matched.push({
        index: route,
        infos: infos_routes_matched
      });
      return matched;
    }, []);
  }

  _retrieveRouteParams(initial_route, model_route) {
    return model_route.reduce((params, route, key) => {
      if (route[0] === ':') {
        const id = route.substring(1);
        params[id] = initial_route[key];
      }
      return params;
    }, {});
  }

  _retrieveInfosRoute(custom_route) {
    const query_routes = custom_route.split('?');
    const routes = query_routes.shift().split('/');
    const query = query_routes.join('&');
    const queries = query.split('&').reduce((queries, query) => {
      if (query === '') return queries;
      const params = query.split('=');
      const key = params.shift();
      const value = params.shift();
      queries[key] = value;
      return queries;
    }, {});

    if (routes[0] === '') {
      routes.shift();
    }
    const route = routes.join('/') || '/';
    
    return {
      route,
      routes,
      query,
      queries
    }
  }  

  _routeAnalysis(custom_route) {
    const { routes } = this._retrieveInfosRoute(custom_route);
    let access_route = '';
    const dynamic_routes = [];
    const static_routes = routes.filter(route => {
      if (route[0] === ':') {
        access_route += '/?';
        dynamic_routes.push(route);
        return false;
      }
      access_route += '/' + route;
      return true;
    });
    return {
      total_routes: routes.length,
      total_static_routes: static_routes.length,
      total_dynamic_routes: dynamic_routes.length,
      access_route: access_route || '/',
      routes,
      dynamic_routes,
      static_routes
    };
  }

  retrieveRoute(method, custom_route) {
    const { routes, query, queries } = this._retrieveInfosRoute(custom_route);
    const routes_matched = this._retrieveRoutesMatched(method, routes);
    const routes_matched_sorted = routes_matched.sort((a, b) =>
      a.infos.exactMatch - b.infos.exactMatch
    );
    const route_matched = routes_matched_sorted.shift();
    if (route_matched) {
      const route_find = this.routes[route_matched.index];
      const params = this._retrieveRouteParams(routes, route_find.route_analyse.routes);
      return {
        route_analyse: route_matched.infos,
        route: route_find,
        query,
        queries,
        params
      };
    }
    const default_route = this.routes[method + '*'];
    return default_route
      ? ({
        route: default_route,
        query,
        queries
      })
      : undefined;
  }

  push(method, route, ...middlewares) {
    const route_analyse = this._routeAnalysis(route);
    this.routes[method + route_analyse.access_route] = {
      method,
      route_analyse,
      middlewares: [...middlewares]
    };
    return this;
  };
};
