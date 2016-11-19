
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');
require('./grid');
require('./shapes');

Crafty.init(500, 500, 'stage');

Crafty.background("#f1eded");
Crafty.e('Grid')
    .attr({x: -50, y: -50, w: 600, h: 600})
    .grid(50, 50);

Crafty.e('SentinelGraphic, Tween')
    .attr({x: 50, y: 50, w: 50, h: 50})
    .origin('center')
    .tween({x: 200, rotation: 360}, 1000);

Crafty.e('OreGraphic, Tween')
    .attr({x: 100, y: 150, w: 50, h: 50})
    .origin('center')
    .tween({rotation: 360 * 10}, 1000 * 20);

Crafty.e('ShipGraphic, Tween')
    .attr({x: 200, y: 200, w: 100, h: 50})
    .origin('center')
    .tween({rotation: 360 * 10}, 1000 * 20);

Crafty.e('Hook, Tween')
    .attr({x: 300, y: 200, w: 50, h: 50})
    .origin('bottom center')
    .tween({rotation: 360}, 1000);
