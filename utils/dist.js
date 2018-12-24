function toRadians(d) { return d * Math.PI / 180; }

/**
 * 计算坐标之间的距离
 * @param  {[type]} lat1 [description]
 * @param  {[type]} lng1 [description]
 * @param  {[type]} lat2 [description]
 * @param  {[type]} lng2 [description]
 * @return {[type]}      [description]
 */
function getDistance(lat1, lng1, lat2, lng2) {
  let dis = 0;
  let radLat1 = toRadians(lat1);
  let radLat2 = toRadians(lat2);
  let deltaLat = radLat1 - radLat2;
  let deltaLng = toRadians(lng1) - toRadians(lng2);
  dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;
}

function distance(coords) {
  let lens = 0;
  for (var i = 0; i < coords.length - 1; i++) {
    lens += getDistance(...coords[i], ...coords[i + 1]);
  }
  return lens;
}

module.exports = distance;