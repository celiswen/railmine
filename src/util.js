
const expect = require('chai').expect;

const sin = Math.sin;
const cos = Math.cos;

exports.deg = n => n/360 * 2*Math.PI;
exports.rad = n => n/(2*Math.PI) * 360;

exports.deg2rad = exports.deg;
exports.rad2deg = exports.rad;

exports.rotate = ([x, y], d) => [x*cos(d) - y*sin(d), x*sin(d) + y*cos(d)];
exports.scale = ([x, y], rx, ry) => [x*rx, y*ry];

exports.center = e => [e.x + e.w/2, e.y + e.h/2];


const vec2 = exports.vec2 = {
    add (v1, v2) {
        let [x1, y1] = vec2.coercion(v1);
        let [x2, y2] = vec2.coercion(v2);
        return [x1 + x2, y1 + y2];
    },
    sub (v1, v2) {
        let [x1, y1] = vec2.coercion(v1);
        let [x2, y2] = vec2.coercion(v2);
        return [x1 - x2, y1 - y2];
    },
    mul (v, k) {
        let [x, y] = vec2.coercion(v);
        return [x * k, y * k];
    },
    length (v) {
        let [x, y] = vec2.coercion(v);
        return Math.sqrt(x * x + y * y);
    },
    unit (v) {
        return vec2.mul(v, 1 / vec2.length(v));
    },
    lengthTo (v1, v2) {
        return vec2.length(vec2.sub(v1, v2));
    },

    valueLerp (v1, v2, k) {
        /*jshint expr: true */
        expect(k).to.be.a('number');
        return vec2.mul(vec2.unit(vec2.sub(v2, v1)), k);
    },

    coercion (obj) {
        /*jshint expr: true */
        expect(obj).to.be.not.undefined;
        let [x, y] = obj.vec2 ? obj.vec2() : obj;
        expect(x).to.be.not.NaN;
        expect(y).to.be.not.NaN;
        return [x, y];
    }
};
