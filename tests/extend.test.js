const Fireflyio = require('../lib');
const FireflyioMonitoring = require('../../fireflyio-monitoring/lib');

(async () => {
  // ---
  const app = new Fireflyio({ debug: true });
  app.extend(FireflyioMonitoring, {
    debug: true
  });
  app.listen(2525);
  // ---
})();
