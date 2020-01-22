const http = require('http');
const https = require('https');
const socketio = require('socket.io');

const RouteManager = require('./route');
const ResponseManager = require('./response');
const MiddlewareManager = require('./middleware');
const EventManager = require('./event');
const { Debug } = require('./utils');

const defaultOptions = {
  debug: false
};

module.exports = class $fireflyio
{
  constructor(custom_options) {
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.debug = Debug(this.options).debug;
    this.server = this.options.https === true
      ? https.createServer(this.options.server)
      : http.createServer(this.options.server);
    this.io = socketio(this.server, this.options.socket);

    this.modules = {};
    this.modules.route = new RouteManager(this.options, this.modules);
    this.modules.response = new ResponseManager(this.options, this.modules);
    this.modules.middleware = new MiddlewareManager(this.options, this.modules);
    this.modules.event = new EventManager(this.options, this.io, this.modules);
  }

  use(middleware) {
    this.modules.middleware.push(middleware);
    return this;
  };

  get(...args) {
    this.modules.route.push('GET', args.shift(), ...args);
    return this;
  };
  
  delete(...args) {
    this.modules.route.push('DELETE', args.shift(), ...args);
    return this;
  };
  
  post(...args) {
    this.modules.route.push('POST', args.shift(), ...args);
    return this;
  };
  
  put(...args) {
    this.modules.route.push('PUT', args.shift(), ...args);
    return this;
  };

  any(...args) {
    this.get(...args).delete(...args).post(...args).put(...args);
    return this;
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
