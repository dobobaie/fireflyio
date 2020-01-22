const io = require('socket.io-client');
const Fireflyio = require('../lib');
const FireflyioMonitoring = require('../../fireflyio-monitoring/lib');

(async () => {
  // ---
  const app = new Fireflyio({ debug: true });
  app.extend(FireflyioMonitoring);
  app.listen(2525);
  // ---
})();
