const socketio = require('socket.io');
const EventEmitter = require('events');

const ResponseManager = require('./response');
const MiddlewareManager = require('./middleware');
const ServerManager = require('./server');
const SocketManager = require('./socket');
const CustomSocketManager = require('./customSocket');

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
    this.modules.event = new EventEmitter();
    this.modules.response = new ResponseManager(this, this.options, this.modules);
    this.modules.middleware = new MiddlewareManager(this, this.options, this.modules);
    this.modules.server = new ServerManager(this, this.options, this.modules);

    this.socket = new CustomSocketManager(this, this.options, this.modules);
  }

  extend(Module, custom_module_options) {
    const module = new Module(this,  custom_module_options);
    if (!module.name || typeof(module.name) !== 'string') {
      this.debug('[DEBUG]', `FIREFLYIO: the name of the module is invalid`);
      return this;
    }
    if (this.modules[module.name]) {
      this.debug('[DEBUG]', `FIREFLYIO: the module ${module.name} already exists`);
      return this;
    }
    this.modules[module.name] = module;
    this[module.name] = module;
    return this;
  }

  use(middleware) {
    this.modules.middleware.push(middleware);
    return this;
  };

  _createServerSocket(port) {
    const server = this.modules.server.createServer(port);
    const io = socketio(server, this.options.socket);
    const socket = new SocketManager(this, this.options, this.modules, io);

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

  async listen(port, callback) {
    if (this.serverIsListening) return ;
    this.serverIsListening = true;
    return new Promise(async (resolve, reject) =>
      await this._createServerSocket(port)
        .then(result => {
          this.socket.socket = result;
          if (callback) return callback(undefined, result);
          resolve(result);
        })
        .catch(err => {
          if (callback) return callback(err);
          reject(err);;
        })
    )
  };
};
