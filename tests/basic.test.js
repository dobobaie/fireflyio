const io = require('socket.io-client');
const Fireflyio = require('../lib');

(async () => {
  // ---
  const fireflyio = new Fireflyio();
  
  fireflyio
    .post('/default', ctx => {
      console.log('/default', ctx);
    })
    .get('/', ctx => {
      console.log('/', ctx);
    });

  await fireflyio.listen(2525);
  // ---

  const socket = io('http://localhost:2525/');

  socket.on('connect', () => {
    console.log('io: connect');
  
    socket.emit('POST', {
      location: '/default',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        username: 'Toot'
      }
    });

    socket.emit('GET', {
      location: '/',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        username: 'Toot'
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('io: disconnect');
  });
})();