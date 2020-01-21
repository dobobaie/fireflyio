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

  retrieveRoute(method, route) {
    const query_routes = route.split('?');
    const route_splited = query_routes.shift().split('/');
    const query = query_routes.join('&');
    const routes_matched = this._retrieveRoutesMatched(method, route_splited);
    const routes_matched_sorted = routes_matched.sort((a, b) =>
      a.infos.exactMatch - b.infos.exactMatch
    );
    const route_matched = routes_matched_sorted.shift();
    if (route_matched) {
      const route_find = this.routes[route_matched.index];
      const params = this._retrieveRouteParams(route_splited, route_find.route_analyse.routes);
      return {
        route_analyse: route_matched.infos,
        route: route_find,
        query,
        params
      };
    }
    const default_route = this.routes[method + '*'];
    return default_route
      ? ({
        route: default_route,
        query
      })
      : undefined;
  }

  _routeAnalysis(route) {
    let route_cleaned = '';
    const routes = route.split('/');
    const dynamic_routes = [];
    const static_routes = routes.filter(route => {
      if (route[0] === ':') {
        route_cleaned += '/?';
        dynamic_routes.push(route);
        return false;
      }
      route_cleaned += '/' + route;
      return true;
    });
    return {
      total_routes: routes.length,
      total_static_routes: static_routes.length,
      total_dynamic_routes: dynamic_routes.length,
      route_cleaned: route_cleaned || '/',
      routes,
      dynamic_routes,
      static_routes
    };
  }

  push(method, route, ...middlewares) {
    const route_analyse = this._routeAnalysis(route);
    this.routes[method + route_analyse.route_cleaned] = {
      method,
      route_analyse,
      middlewares: [...middlewares]
    };
    return this;
  };
};
