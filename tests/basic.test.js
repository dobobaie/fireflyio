const Fireflyio = require('../../fireflyio/lib');
const FireflyioClient = require('../../fireflyio-client/lib');
const FireflyioRouter = require('../../fireflyio-router/lib');

(async () => {
  // ---
  // const app = new Fireflyio({ debug: true });
  
  // app.extend(FireflyioRouter);

  // app.use(async (ctx, next) => {
  //   const start = Date.now();
  //   await next();
  //   const ms = Date.now() - start;
  //   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  // });

  // app
  //   .router
  //   .focus('/users', router =>
  //     router.delete('/:id/delete', ctx => {
  //       console.log('/users/:id/delete', ctx);
  //       ctx.body = {
  //         result: true
  //       };
  //     })
  //   )
  //   .post('/login', ctx => {
  //     console.log('/login', ctx);
  //     ctx.body = {
  //       result: true
  //     };
  //   })
  //   .get('/hello', ctx => {
  //     console.log('/hello', ctx);
  //     ctx.body = {
  //       message: 'Hello'
  //     };
  //   });

  // await app.listen(2525);
  // ---

  // ---
  // const fireflyioClient = new FireflyioClient('http://localhost:2525/', {
  //   debug: true,
  //   timeout: 5000
  // });
  
  // fireflyioClient.delete('/users/toto/delete').then(response =>
  //   console.log('delete /users/toto/delete response', response)
  // ).catch(err => console.log('error delete /users/toto/delete', err));

  // fireflyioClient.get('/hello').then(response =>
  //   console.log('get /hello response', response)
  // ).catch(err => console.log('error get /hello', err));

  // fireflyioClient.post('/login', {
  //   username: 'Toto',
  //   password: 'Tutu'
  // }).then(response =>
  //   console.log('post /login response', response)
  // ).catch(err => console.log('error post /login', err));
  // ---

  const fireflyioClient = new FireflyioClient('http://localhost:5656/', {
    debug: true,
    timeout: 5000
  });

  fireflyioClient.get('/').then(response => {
    console.log('get', response);
  });

  fireflyioClient.get('/health').then(response => {
    console.log('get', response);
  });

})();
