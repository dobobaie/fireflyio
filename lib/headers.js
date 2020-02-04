const Promise = require('bluebird');

const { Debug } = require('./utils');

module.exports = class Headers
{
  constructor(ctx) {
    this.ctx = ctx;
  }

  set(key, value) {
    this.ctx.headers[key] = value;
  }

  get(key) {
    return this.ctx.headers[key];
  }
};
