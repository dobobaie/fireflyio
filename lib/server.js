const http = require('http');
const https = require('https');
const stream = require('stream');

const { Debug } = require('./utils');

module.exports = class $fireflyio
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
  }

  async _newHttpClient(req, res)
  {
    const method = req.method;
    const request = {
      uuid: undefined,
      method,
      location: req.url,
      headers: req.headers,
      body: req.body
    };

    this.debug('[DEBUG]', 'FIREFLYIO: new http request', method, request.location, request.uuid);
    const response = await this.modules.middleware.newRequest(method, request);
    res.setHeader('Content-Type', response.headers['Content-Type'] || 'application/json');

    if (response.body instanceof stream.Readable) {
      response.body.pipe(res);
      return ;
    }
    
    const body = typeof response.body === 'object' ? JSON.stringify(response.body) : response.body;
    res.end(body);
  }

  _exposeHTTPServer(req, res) {
    if (this.options.allowedHttpRequests !== true) {
      const access_route = req.url.split('?').shift(); // ?
      if (this.options.blackListHttpRequests.includes(access_route)
        || !this.options.whiteListHttpRequests.includes(access_route)) {
        return ;
      }
    }
    this._newHttpClient(req, res);
  }

  createServer() {
    const server = this.options.https === true || this.options.ssl === true || this.options.secure === true
      ? https.createServer(
          (...args) => this._exposeHTTPServer(...args),
          this.options.server
        )
      : http.createServer(
          (...args) => this._exposeHTTPServer(...args),
          this.options.server
        );
   return server; 
  }
};
