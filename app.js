let http = require('http');
let data = require('./data.js');

let server = http.createServer(function(req, res){
  console.log('Request was made: ' + req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(data.getDepth(1,1));
});

server.listen(3000, '127.0.0.1');
