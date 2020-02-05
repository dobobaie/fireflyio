const { Debug } = require('./utils');

module.exports = class Response
{
  constructor(fireflyio, options) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
  }

  _save(response) {
    return response;
    // return JSON.parse(JSON.stringify(response));
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
};
