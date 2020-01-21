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
        code: 200
      },
      headers: ctx.headers,
      body: ctx.body
    });
  }
  
  retrieveError(uuid, error) {
    let response = null;
    switch (error)
    {
      case '404':
        response = {
          error: 'Not Found',
          code: parseInt(error, 10) || 500
        };
        break;
      case '500':
      default:
        response = {
          error: 'Internal Server Error',
          code: parseInt(error, 10) || 500
        };
    }
    return this._save({
      uuid,
      date: new Date(),
      response
    });
  }
};
