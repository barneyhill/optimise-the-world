const http = require('http');
const hgt = require('node-hgt')
const server = http.createServer(function(req, res){
	console.log('Request was made: ' + req.url);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	var tileset = new hgt.TileSet('/media/chrx/SSD/data/');
	tileset.getElevation([57.99,11.9], function(err, elevation){
		if (err){
			return console.log(err);
		};
		console.log('Elevation:'+ elevation);
		res.end(elevation.toString());
	});

});

server.listen(3000, '127.0.0.1');
