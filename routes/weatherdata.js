var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(req.query.requestType);
  var requestName = null;
  var requestFrequency = 1000 * 60 * 60; // one hour
  switch (req.query.requestType) {
    default:
    case 'conditions':
      requestName = 'conditions';
      requestFrequency = 1000 * 60 * 10;
      break;
    case 'forecast10day':
      requestName = 'forecast10day';
      break;
  }
  if (!res.app.locals.weatherdata.hasOwnProperty(requestName)) {
    res.app.locals.weatherdata[requestName] = {};
  }
  var now = new Date();
  if (!res.app.locals.weatherdata[requestName].time ||
    (now.getTime() - res.app.locals.weatherdata[requestName].time) > requestFrequency) {
    console.log('fetching weather');
    req.app.locals.wunderground[requestName]({
        city:'Chapel Hill',
        state: 'NC'
      },
    function(err, data) {
      if (err) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
      } else {
        res.app.locals.weatherdata[requestName].data = data;
        res.app.locals.weatherdata[requestName].time = now.getTime();
        res.send(res.app.locals.weatherdata[requestName].data);
      }
    });
  } else {
    console.log('weather was cached');
    res.send(res.app.locals.weatherdata[requestName].data);
  }
});

module.exports = router;
