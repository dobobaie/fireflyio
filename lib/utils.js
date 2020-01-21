/**
 * @name: probaRouteMatch
 **/
const probaRouteMatch = (route_to_match, routes) =>
  route_to_match
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

/**
 * @name: routeAnalysis
 **/
const routeAnalysis = route => {
  let route_cleaned = '';
  const routes = route.split('/');
  const dynamic_routes = [];
  const static_routes = routes.filter(route => {
    if (route[0] === ':') {
      route_cleaned += '/?';
      dynamic_routes.push(route.substring(1));
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
};

module.exports = {
  probaRouteMatch,
  routeAnalysis
};
