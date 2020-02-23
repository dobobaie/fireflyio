const Fireflyio = require('../lib');
const app = new Fireflyio({ debug: true, allowedHttpRequests: true });

app.use(ctx => {
  ctx.body = 'Hello Fireflyio';
});

app.socket.on("clientConnected", client =>
  client.emit("HELLO_CLIENT", (_, next) => {
    // everything is ok
    next();
  }, 'Hello Fireflyio')
);

app.listen(4000);
