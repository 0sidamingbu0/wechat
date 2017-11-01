var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
console.log('/user');
  res.sendFile( __dirname + "/public/" + "device.html" );
});


module.exports = router;
