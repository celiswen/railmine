
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');

const util = require('./util');
require('./grid');
require('./shapes');
require('./entities');

Crafty.init(500, 500, 'stage');

Crafty.background("#f1eded");
Crafty.e('Grid')
    .attr({x: -50, y: -50, w: 600, h: 600})
    .grid(50, 50);

Crafty.e('Sentinel')
    .sentinel({detectRange: 150, color: '#000000', speed: 100})
    .centerAt({x: 400, y: 50});

Crafty.e('Ore')
    .ore({size: 1.5, weight: 40, value: 10, color: 'red'})
    .centerAt({x: 100, y: 400});

let node1 = Crafty.e('Node')
    .setName('node1')
    .attr({x: 100, y: 200});

let node2 = Crafty.e('Node')
    .setName('node2')
    .attr({x: 200, y: 300});

let node3 = Crafty.e('Node')
    .setName('node3')
    .attr({x: 350, y: 250});

let node4 = Crafty.e('Node')
    .setName('node4')
    .attr({x: 350, y: 100});

let node5 = Crafty.e('Node')
    .setName('node5')
    .attr({x: 300, y: 350});

node1.connect(node2);
node2.connect(node3);
node2.connect(node4);
node2.connect(node5);

node4.connect(node1);
node3.connect(node4);
node5.connect(node3);

// node3.connect(node5);

let ship = Crafty.e('Ship')
    .attr({x: 200, y: 200})
    .origin('center');

let hook = Crafty.e('Hook')
    .attr({x: 200, y: 200})
    .attachTo(ship);

ship.startAt(node1);

setInterval(function () {
    node2.switchPath();
}, 1000);
