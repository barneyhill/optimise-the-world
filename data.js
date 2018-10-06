let GeoTIFF = require('geotiff')
let getDepth = function(lat, long){
  const tiff = GeoTIFF.fromFile('/media/chrx/SSD/srtm_10_01.tif');
  const image = tiff.getImage();
  const width = image.getWidth();
  return width;

};
module.exports.getDepth = getDepth;
