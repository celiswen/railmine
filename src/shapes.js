
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');

const scale = require('./util').scale;
const rotate = require('./util').rotate;
const deg = require('./util').deg;
const deg2rad = require('./util').deg;
const center = require('./util').center;
const depth = require('./util').depth;


Crafty.c('Shape', {
    required: '2D, Canvas',
    init () {
        this._borderColor = '#000000';
        this._shapeColor = '#FFFFFF';
        this._scale = 0.85;
        this._borderWidth = 4;
        this._polygon = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];

        this.z = 10;
        this.origin('center');
        this.ready = true;
        this.bind('Draw', this._drawShape);
        this.trigger('Invalidate');
    },
    shape (polygon) {
        this._polygon = polygon;
        this.trigger('Invalidate');
        return this;
    },
    color (color) {
        this._shapeColor = color;
        this.trigger('Invalidate');
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
    let thickness = 0.05;
    let width = 0.3;
    let front = -0.4;
    let mid = -0.2;
    let back = 0.1;

    let vertices = [[0, back],
                    [-width, mid], [-width, front],
                    [-width + thickness, front], [-width + thickness, mid],
                    [0, back - thickness],
                    [width - thickness, mid], [width - thickness, front],
                    [width, front], [width, mid]];
    return _.map(vertices, ([x, y]) => [-y, x]);
})();

Crafty.c('HookGraphic', {
    required: 'Shape',
    init () {
        this.z = 15;
        this.shape(hookModel);
        this.color('#666666');
    },
});

Crafty.c('NodeGraphic', {
    required: 'Shape',
    init () {
        let size = 0.3;
        this.shape([[-size, -size], [size, -size], [size, size], [-size, size]]);
        this.color('#1d63ff');
        this.z = 10;
    },
});

Crafty.c('CoinGraphic', {
    required: 'Shape',
    init () {
        let side = 16;
        this.shape(_.times(side, i => {
            return rotate([0.3, 0], deg2rad(i/side * 360));
        }));
        this.color('#eccf35');
        this.z = 50;
    }
});

Crafty.c('ClockGraphic', {
    required: 'Shape',
    init () {
        let side = 16;
        this.shape([[0, -0.3], [0, -0.4], [0, 0], [0, -0.3]].concat(_.times(side, i => {
            return rotate([0, -0.3], deg2rad(i/side * 360));
        })));
        this.z = 50;
    }
});

let boundingRect = function (r1, r2) {
    let margin = 30;
    let [x1, y1] = center(r1);
    let [x2, y2] = center(r2);

    if (x1 > x2) {
        [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
        [y1, y2] = [y2, y1];
    }
    return {x: x1 - margin,
            y: y1 - margin,
            w: x2 - x1 + 2*margin,
            h: y2 - y1 + 2*margin};
};

Crafty.c('PathGraphic', {
    required: '2D, Canvas',
    init () {
        this._pathColor = '#000000';
        this._pathWidth = 5;

        this.ready = true;
        this.bind('Draw', this._drawPath);
        this.trigger('Invalidate');
    },
    path (from, to) {
        this._fromNode = from;
        this._toNode = to;

        this._fromNode.requires('2D').bind('Move', e => this.recalculate());
        this._toNode.requires('2D').bind('Move', e => this.recalculate());

        this.recalculate();
        this.trigger('Invalidate');
        return this;
    },
    color (color) {
        this._pathColor = color;
        this.trigger('Invalidate');
        return this;
    },
    thickness (thickness) {
        this._pathWidth = thickness;
        return this;
    },
    recalculate () {
        this.attr(boundingRect(this._fromNode, this._toNode));
        this.trigger('Invalidate');
        return this;
    },
    _drawPath ({ctx, pos, co}) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = this._pathColor;
        ctx.lineWidth = this._pathWidth;
        ctx.moveTo(...center(this._fromNode));
        ctx.lineTo(...center(this._toNode));
        ctx.stroke();
        ctx.restore();
    }
});
