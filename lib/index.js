const socketio = require('socket.io');

const RouteManager = require('./route');
const ResponseManager = require('./response');
const MiddlewareManager = require('./middleware');
const ServerManager = require('./server');
const SocketManager = require('./socket');

const { Debug } = require('./utils');

const defaultOptions = {
  debug: false,
  https: false,
  ssl: false,
  allowedHttpRequests: false,
  whiteListHttpRequests: [],
  blackListHttpRequests: []
};

module.exports = class $fireflyio
{
  constructor(custom_options) {
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.debug = Debug(this.options).debug;
    this.serverIsListening = false;

    this.modules = {};
    this.modules.route = new RouteManager(this.options, this.modules);
    this.modules.response = new ResponseManager(this.options, this.modules);
    this.modules.middleware = new MiddlewareManager(this.options, this.modules);
    this.modules.server = new ServerManager(this.options, this.modules);
  }

  extend(Module, custom_options) {
    const module = new Module(this,  custom_options);
    this.modules[module.name] = module;
    return this;
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

  _createServerSocket(port) {
    const server = this.modules.server.createServer(port);
    const io = socketio(server, this.options.socket);
    const socket = new SocketManager(this.options, this.modules, io);

    this.debug('[DEBUG]', `FIREFLYIO: creating a new server on port: ${port}`);
    return new Promise((resolve, reject) =>
      server.listen(port, (err) => {
        if (err) {
          this.debug('[DEBUG]', `FIREFLYIO: server ${port} have an error ${err}`);
          return reject(err);
        }
        this.debug('[DEBUG]', `FIREFLYIO: server ${port} is ready to listen`);
        resolve(socket);
      })
    );
  }

  async listen(port) {
    if (this.serverIsListening) return ;
    this.serverIsListening = true;
    return this._createServerSocket(port);
  };
};
