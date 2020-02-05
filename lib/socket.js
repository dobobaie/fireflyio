const { Debug } = require('./utils');

module.exports = class Socket
{
  constructor(fireflyio, options, modules, io) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
    this.clients = { list: {}, number: 0 };
    this._initializeIoListeners(io);
  }

  async _newRequestReceived(client, method, request) {
    this.debug('[DEBUG]', 'FIREFLYIO: new socket request', method, request.location, request.uuid);
    const response = await this.modules.middleware.newRequest(method, request);
    client.emit('GET', response);
  }

  _clientDisconnect(client) {
    this.debug('[DEBUG]', `FIREFLYIO: connection closed`, client.id);
    delete this.clients.list[client.id];
    this.clients.number -= 1;
    this.modules.event.emit('clientDisconnected', this.fireflyio.socket._client(client));
  }

  _clientAuthenticate(client, request) {
    this.clients.list[client.id].authorization = request.headers && request.headers.Authorization;
    this.modules.event.emit('clientAuthenticated', this.fireflyio.socket._client(client));
    const response = this.modules.response.retrieve(request.uuid, {
      headers: request.headers,
      body: { authorization: request.headers.Authorization }
    });
    client.emit('GET', response);
  }

  _initializeClientListeners(client) {
    ['GET', 'DELETE', 'POST', 'PUT'].map(method =>
      client.on(method, request =>
        this._newRequestReceived(client, method, request)
      )
    );

    client.on('AUTHENTICATE', request =>
      this._clientAuthenticate(client, request)
    );

    client.on('disconnect', () =>
      this._clientDisconnect(client)
    );
  }

  _newClientConnection(client) {
    this.debug('[DEBUG]', `FIREFLYIO: new connection`, client.id);
    this.clients.list[client.id] = { client };
    this.clients.number += 1;
    this.modules.event.emit('clientConnected', this.fireflyio.socket._client(client));
    this._initializeClientListeners(client);
    client.emit('hello');
  }

  _initializeIoListeners(io) {
    this.modules.event.emit('ready', this.fireflyio.socket);
    io.on('connection', client =>
      this._newClientConnection(client)
    );
  }

  retrieveClientById(client_id) {
    return this.clients.list[client_id];
  }

  getClientsList() {
    return this.clients.list;
  }

  getNumberClients() {
    return this.clients.number;
  }
};
