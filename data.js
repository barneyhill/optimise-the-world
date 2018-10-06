let gdal = require('gdal')
let getDepth = function(lat, long){
  let dataset = gdal.open("/media/chrx/SSD/srtm_10_02.tif");
  console.log(dataset.rasterSize.x);

}
module.exports.getDepth = getDepth;
