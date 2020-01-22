const { Debug } = require('./utils');

module.exports = class Event
{
  constructor(options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.modules = modules;
  }

  async _newRequestReceived(client, method, request) {
    this.debug('[DEBUG]', 'FIREFLYIO: new request', method, request.location, request.uuid);
    const toEmit = await this.modules.middleware.newRequest(method, request);
    client.emit('GET', toEmit);
  }

  _initializeClientListeners(client) {
    client.emit('hello');

    ['GET', 'DELETE', 'POST', 'PUT'].map(method =>
      client.on(method, request =>
        this._newRequestReceived(client, method, request)
      )
    );

    client.on('disconnect', () => {
      this.debug('[DEBUG]', `FIREFLYIO: connection closed`, client.id);
    });
  }

  _newClient(client) {
    this.debug('[DEBUG]', `FIREFLYIO: new connection`, client.id);
    this._initializeClientListeners(client);
  }

  initializeListeners(io) {
    io.on('connection', client => this._newClient(client));
  }
};
