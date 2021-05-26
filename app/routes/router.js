var express = require('express');
var router = express.Router()

var proxyRouter = require('./proxyService')

router.use((req, res, next) => {
    console.log(`Called: ${req.method} ${req.path}`)
    next()
})

router.use(function(req, res, next){
    res.on('finish', function(){
      console.log("Status: " + res.statusCode);
    });
    next();
  }); 

router.use(proxyRouter)

module.exports = router