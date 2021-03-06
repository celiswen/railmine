
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');


Crafty.c('Grid', {
    required: '2D, Canvas, Mouse',
    init () {
        this._gridWidth = 50;
        this._gridHeight = 50;
        this._radius = 3;
        this._color = '#bfbfbf';
        this._lineWidth = 1;
        this._lineDash = 5;
        this._lineDashEmpty = 5;

        this.ready = true;
        this.bind('Draw', this._drawGrid);
        this.trigger('Invalidate');
    },
    grid (gridWidth, gridHeight) {
        this._gridWidth = gridWidth;
        this._gridHeight = gridHeight;
        this.trigger('Invalidate');
        return this;
    },
    _drawGrid ({ctx, pos, co}) {
        let horizLineCount = ~~(pos._w / this._gridWidth) + 1;
        let vertiLineCount = ~~(pos._h / this._gridHeight) + 1;

        ctx.save();
        ctx.translate(pos._x, pos._y);
        ctx.lineWidth = this._lineWidth;
        ctx.setLineDash([this._lineDash, this._lineDashEmpty]);
        ctx.strokeStyle = this._color;
        ctx.fillStyle = this._color;

        // draw the vertical lines
        ctx.beginPath();
        _.times(horizLineCount, i => {
            ctx.moveTo(i * this._gridWidth, 0);
            ctx.lineTo(i * this._gridWidth, pos._h);
        });

        // draw the horizonal lines
        _.times(vertiLineCount, j => {
            ctx.moveTo(0     , j * this._gridHeight);
            ctx.lineTo(pos._w, j * this._gridHeight);
        });
        ctx.stroke();

        // draw the dots
        ctx.beginPath();
        _.times(horizLineCount, i => {
            _.times(vertiLineCount, j => {
                ctx.moveTo(i * this._gridWidth, j * this._gridHeight);
                ctx.arc(i * this._gridWidth,
                        j * this._gridHeight,
                        this._radius,
                        0,
                        2 * Math.PI);
            });
        });
        ctx.fill();
        ctx.restore();
    }
});
