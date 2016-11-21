
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');

const util = require('./util');
const levelJson = require('./level');
require('./grid');
require('./shapes');
require('./ui');
require('./entities');

Crafty.init(500, 500, 'stage');
Crafty.viewport.clampToEntities = false;

Crafty.background("#f1eded");
Crafty.e('Grid')
    .attr({x: -300, y: -700, w: 3000, h: 1000})
    .grid(50, 50);

let deepCopy = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

let levelBuilder = function (levelJson) {
    let nodes = deepCopy(levelJson.map.nodes);
    _.each(nodes, ([x, y], name) => {
        nodes[name] = Crafty.e('Node').attr({x, y});
    });

    let paths = levelJson.map.paths;
    _.each(paths, (connections, node) => {
        _.each(connections, target => {
            nodes[node].connect(nodes[target]);
        });
    });

    let ores = levelJson.map.ores;
    _.each(ores, ore => {
        Crafty.e('Ore').ore(ore).centerAt(ore.at);
    });

    let sentinels = levelJson.map.sentinels;
    _.each(sentinels, sentinel => {
        Crafty.e('Sentinel').sentinel(sentinel).centerAt(sentinel.at);
    });

    let ship = Crafty.e('Ship')
        .ship(levelJson.player.ship)
        .startAt(nodes[_.sample(levelJson.map.start)]);

    let hook = Crafty.e('Hook')
        .hook(levelJson.player.hook)
        .attachTo(ship);

    Crafty.viewport.follow(ship);


    let ui = Crafty.e('Static');
    let y = 0;
    _.each(levelJson.goal, (data, type) => {
        let comp = `${util.capitalize(type)}Goal`;
        ui.attach(Crafty.e(comp).goal(data).attr({y}));
        y += 50;
    });
    ui.fixedAt({x: 0, y: 0});

    setInterval(function () {
        _.each(nodes, n => n.switchPath());
    }, 1000);
};

Crafty.bind('GetOre', ({type}) => console.log('get ore ' + type));
Crafty.bind('GetCoins', ({value}) => console.log('get money ' + value));

levelBuilder(levelJson);

// Crafty.viewport.scale(0.5);
