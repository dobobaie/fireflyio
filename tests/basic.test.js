const Fireflyio = require('../lib');
const FireflyioClient = require('../../fireflyio-client/lib');

(async () => {
  // ---
  const app = new Fireflyio({ debug: true });

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });

  app
    .delete('/users/:id/delete', ctx => {
      console.log('/users/:id/delete', ctx);
      ctx.body = {
        result: true
      };
    })
    .post('/login', ctx => {
      console.log('/login', ctx);
      ctx.body = {
        result: true
      };
    })
    .get('/hello', ctx => {
      console.log('/hello', ctx);
      ctx.body = {
        message: 'Hello'
      };
    });

  await app.listen(2525);
  // ---

  // ---
  const fireflyioClient = new FireflyioClient('http://localhost:2525/', {
    debug: true,
    timeout: 5000
  });
  
  fireflyioClient.delete('/users/toto/delete').then(response =>
    console.log('delete /users/toto/delete response', response)
  ).catch(err => console.log('error delete /users/toto/delete', err));

  fireflyioClient.get('/hello').then(response =>
    console.log('get /hello response', response)
  ).catch(err => console.log('error get /hello', err));

  fireflyioClient.post('/login', {
    username: 'Toto',
    password: 'Tutu'
  }).then(response =>
    console.log('post /login response', response)
  ).catch(err => console.log('error post /login', err));
  // ---
})();
