const Fireflyio = require('../lib');
const app = new Fireflyio({ debug: true, allowedHttpRequests: true });

app.use(ctx => {
  ctx.body = 'Hello Fireflyio';
});
 
app.listen(4000);
