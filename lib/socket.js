const { Debug } = require('./utils');

module.exports = class Socket
{
  constructor(options, modules, io) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.modules = modules;
    this.clients = { list: {}, number: 0 };
    this._initializeIoListeners(io);
  }

  async _newRequestReceived(client, method, request) {
    this.debug('[DEBUG]', 'FIREFLYIO: new request', method, request.location, request.uuid);
    const toEmit = await this.modules.middleware.newRequest(method, request);
    client.emit('GET', toEmit);
  }

  _initializeClientListeners(client) {
    ['GET', 'DELETE', 'POST', 'PUT'].map(method =>
      client.on(method, request =>
        this._newRequestReceived(client, method, request)
      )
    );

    client.on('disconnect', () => {
      this.debug('[DEBUG]', `FIREFLYIO: connection closed`, client.id);
      delete this.clients[client.id];
      this.clients.number -= 1;
    });
  }

  _newClientConnection(client) {
    this.debug('[DEBUG]', `FIREFLYIO: new connection`, client.id);
    this.clients[client.id] = client;
    this.clients.number += 1;
    this._initializeClientListeners(client);
    client.emit('hello');
  }

  _initializeIoListeners(io) {
    io.on('connection', client =>
      this._newClientConnection(client)
    );
  }

  getNumberClients() {
    return this.clients.number;
  }
};
