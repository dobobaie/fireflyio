const Promise = require('bluebird');
const EventEmitter = require('events');

const { Debug } = require('./utils');

module.exports = class CustomSocket
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
    this.socket = null;
  }
  
  _client({ id })
  {
    const client = this.socket.retrieveClientById(id);
    const _executeMiddleware = (position, middlewares) => {
      if (middlewares.length === 0) return ;
      return new Promise(async (resolve, reject) => {
        try {
          await middlewares[position](
            { authorization: client.authorization },
            async () => {
              if (middlewares[position + 1]) {
                return await this._executeMiddleware(position + 1, middlewares);
              }
              resolve();
            }
          );
        } catch (err) {
          //
        }
        reject();
      })
    };
    return {
      emit: (...args) => {
        const event = args.shift();
        const data = args.pop();
        _executeMiddleware(0, args)
          .then(() => 
            client.client.emit('events', {
              event,
              data 
            })
          ).catch(() => null);
      }
    };
  };
  
  on(...args) {
    return this.modules.event.on(...args);
  }

  diffuse(...args) {
    const clients = this.socket.getClientsList();
    Object.keys(clients).forEach(client_key =>
      this._client(clients[client_key].client).emit(...args)
    );
  };
};
