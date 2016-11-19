
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');

const scale = require('./util').scale;
const rotate = require('./util').rotate;
const deg = require('./util').deg;

Crafty.c('Shape', {
    required: '2D, Canvas',
    init () {
        this._borderColor = '#000000';
        this._shapeColor = '#FFFFFF';
        this._scale = 0.85;
        this._borderWidth = 4;
        this._polygon = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];

        this.ready = true;
        this.bind('Draw', this._drawShape);
        this.trigger('Invalidate');
    },
    shape (polygon) {
        this._polygon = polygon;
        return this;
    },
    color (color) {
        this._shapeColor = color;
        return this;
    },
    _drawShape ({ctx, pos, co}) {
        let polygon = _.map(this._polygon,
            _.partial(scale, _, this._scale * this._w, this._scale * this._h));

        ctx.save();
        ctx.translate(pos._x + pos._w/2, pos._y + pos._h/2);
        ctx.lineWidth = this._borderWidth;
        ctx.strokeStyle = this._borderColor;
        ctx.fillStyle = this._shapeColor;

        ctx.beginPath();
        let [hx, hy] = _.head(polygon);
        ctx.moveTo(hx, hy);
        _.each(polygon, ([x, y]) => {
            ctx.lineTo(x, y);
        });
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
});


const sentinelShape = (() => {
    let [outer, inner] = [0.5, 0.15];
    return _.flatten(_.times(4, i => [
        rotate([outer, 0], i * deg(90)),
        rotate([inner, inner], i * deg(90))
    ]), true);
})();

Crafty.c('SentinelGraphic', {
    required: 'Shape',
    init () {
        this.shape(sentinelShape);
        this.color('#eb78ed');
    }
});


Crafty.c('OreGraphic', {
    required: 'Shape',
    init () {
        this.shape(_.times(3, i => rotate([0.5, 0], deg(120 * i))));
        this.color('#65d2e9');
    },
});

const shipModel = (() => {
    let back = -0.3;
    let front = 0.10;
    let tip = 0.35;
    let width = 0.35;
    return [[back, -width], [front, -width], [tip, 0], [front, width], [back, width]];
})();


Crafty.c('ShipGraphic', {
    required: 'Shape',
    init () {
        this.shape(shipModel);
        this.color('#f4735d');
    },
});

const hookModel = (() => {
    let thickness = 0.1;
    let width = 0.4;
    let front = -0.4;
    let mid = 0;
    let back = 0.45;
    return [[0, back],
            [-width, mid], [-width, front],
            [-width + thickness, front], [-width + thickness, mid],
            [0, back - thickness],
            [width - thickness, mid], [width - thickness, front],
            [width, front], [width, mid]];
})();

Crafty.c('Hook', {
    required: 'Shape',
    init () {
        this.shape(hookModel);
        this.color('#666666');
    },
});
