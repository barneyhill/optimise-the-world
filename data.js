let hgt = require('node-hgt')
let getDepth = async function(lat,long){
	return 'AAA'
	let tileset = new hgt.TileSet('/media/chrx/SSD/data/');
    tileset.getElevation([lat,long], function(err, elevation) {
    	console.log('...' + elevation);
        if (err) {
            console.log('getElevation failed: ' + err.message);
        } else {
            return elevation;
        }
        return 'Whoops'
    });
};
module.exports.getDepth = getDepth;
