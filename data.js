let hgt = require('node-hgt')

var getElevation = async function(long, lat){
  var tileset = new hgt.TileSet('/media/chrx/SSD/data/');
  tileset.getElevation([req.query.lat, req.query.long], function(err, elevation) {
  	if (err) {
			console.log('getElevation failed: ' + err.message);
      } else {
				return elevation;
      };
  });
}

module.exports.getElevation = getElevation;
