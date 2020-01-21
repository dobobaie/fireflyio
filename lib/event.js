const { Debug } = require('./utils');

module.exports = function(options, io, modules)
{
  const debug = Debug(options).debug;

  io.on('connection', client =>
  {
    debug('[DEBUG]', `FIREFLYIO: new connection`, client.id);
    ['GET', 'DELETE', 'POST', 'PUT'].map(method =>
      client.on(method, async data => {
        debug('[DEBUG]', 'FIREFLYIO: new request', method, data.location, data.uuid);
        const toEmit = await modules.middleware.newRequest(method, data);
        client.emit('GET', toEmit);
      })
    );
    client.on('disconnect', () => {
      debug('[DEBUG]', `FIREFLYIO: connection closed`, client.id);
    });
  });
};
