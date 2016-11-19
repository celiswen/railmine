
const sin = Math.sin;
const cos = Math.cos;

exports.deg = n => n/360 * 2*Math.PI;

exports.rotate = ([x, y], d) => [x*cos(d) - y*sin(d), x*sin(d) + y*cos(d)];
exports.scale = ([x, y], rx, ry) => [x*rx, y*ry];
