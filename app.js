const hgt = require('node-hgt');
const express = require('express');
const data = require('./data');

var app = express();

app.get('/elevation', function(req, res){
	var tileset = new hgt.TileSet('/media/chrx/SSD/data/');
	var start = new Date();
	tileset.getElevation([req.query.lat, req.query.long], function(err, elevation) {
  	if (err) {
			console.log('getElevation failed: ' + err.message);
      } else {
				var end = new Date();
				var time = end.getTime()-start.getTime();
				res.send('Elevation: ' + elevation +',' + time);
      };
  });
});

app.get('/descent', function(req, res){
	data.getElevation(req.query.lat, req.query.long).then(elevation => res.send(elevation));
});
app.listen(8000);
