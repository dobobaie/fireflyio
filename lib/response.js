const { Debug } = require('./utils');

module.exports = class Reponse
{
  constructor(options) {
    this.options = options;
    this.debug = Debug(this.options).debug;
  }

  _save(response) {
    return JSON.parse(JSON.stringify(response));
  }

  retrieve(uuid, ctx) {
    return this._save({
      uuid,
      date: new Date(),
      response: {
        code: ctx.status || 200,
        error: ctx.errorMessage
      },
      headers: ctx.headers,
      body: ctx.body
    });
  }
  
  retrieveError(uuid, error) {
    let ctx = {};
    switch (error)
    {
      case '404':
        ctx.errorMessage = 'Not Found';
        ctx.status = parseInt(error, 10) || 500;
        ctx.body = {
          error: ctx.errorMessage
        };
        break;
      case '500':
      default:
        ctx.errorMessage = 'Internal Server Error';
        ctx.status = parseInt(error, 10) || 500;
        ctx.body = {
          error: ctx.errorMessage
        };
    }
    return this.retrieve(uuid, ctx);
  }
};
