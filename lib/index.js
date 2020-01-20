const server = require('http').createServer();
const io = require('socket.io')(server);

const defaultOptions = {
  debug: false
};

module.exports = class $fireflyio
{
  constructor(custom_options) {
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.middlewares = [];
    this.routes = {};

    // ---
    io.on('connection', client =>
    {
      console.log('New connection');

      ['GET', 'DELETE', 'POST', 'PUT'].map(method =>
        client.on(method, data =>
          this._processEvent(method, data)
        )
      );

      client.on('disconnect', () => {
        console.log('Disconnect');
      });
    });
    // ---
  }

  _processEvent(method, data) {
    if (this.routes[method + data.location]) {
      this.routes[method + data.location].middlewares.map(
        middleware => middleware({
          method: method,
          location: data.location,
          headers: data.headers,
          body: data.body
        })
      );
    }
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  };

  _pushRoute(method, route, ...middlewares) {
    this.routes[method + route] = {
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
  
  async listen(port) {
    return new Promise((resolve, reject) =>
      server.listen(port, (err) => {
        if (err) return reject(err);
        resolve();
      })
    );
  };
};
