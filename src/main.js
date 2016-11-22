
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');

const util = require('./util');
const levels = require('./levels');
require('./grid');
require('./shapes');
require('./ui');
require('./entities');

let debugMode = false;


let completionStatus;

let levelBuilder = function (levelJson) {
    let nodes = util.clone(levelJson.map.nodes);
    _.each(nodes, ([x, y], name) => {
        nodes[name] = Crafty.e('Node')
            .node(levelJson.map.switchs[name])
            .attr({x, y});

        if (_.contains(levelJson.map.start, name)) {
            nodes[name]._nodeGraphic.color('#57d69d');
        } else if (_.contains(levelJson.map.end, name)) {
            nodes[name]._nodeGraphic.color('#ff8144');
        }
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

    Crafty.one('ReachEndNode', () => {
        let completion = [];
        Crafty('Goal').each(function () {
            completion.push(this.fulfilled());
        });
        if (_.all(completion)) {
            Crafty.trigger('LevelComplete');
        } else {
            Crafty.trigger('LevelFail');
        }
    });

    Crafty.one('LevelComplete', () => {
        Crafty.scene('complete', levelJson);
    });

    Crafty.one('LevelFail', () => {
        Crafty.scene('fail', levelJson);
    });

    // create a large enough field
    let margin = 400;
    let [minX, minY] = [_.min(nodes, n => n.x).x, _.min(nodes, n => n.y).y];
    let [maxX, maxY] = [_.max(nodes, n => n.x).x, _.max(nodes, n => n.y).y];

    let grid = Crafty.e('Grid')
        .attr({
            x: minX - margin,
            y: minY - margin,
            w: maxX - minX + margin*2,
            h: maxY - minY + margin*2,
            z: -20,
        })
        .grid(50, 50);

    if (debugMode) {
        console.log('DEBUG MODE');
        Crafty.viewport.scale(0.5);
        grid.requires('Mouse')
            .attr({z: 1})
            .bind('Click', e => {
                console.log('clicked on', e.realX, e.realY);
            });
    }
};

let backgroundGrid = () => {
    Crafty.e('Grid')
        .attr({x: 0, y: 0, w: 3000, h: 1000})
        .grid(50, 50);
};

Crafty.scene('title', function () {
    backgroundGrid();

    Crafty.e('2D, DOM, Text')
        .attr({x: 100, y: 100, w: 300, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '50px'})
        .text('RAILMINE');

    Crafty.e('2D, DOM, Text')
        .attr({x: 95, y: 110, w: 300, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '50px'})
        .text('_________');

    _.times(Math.min(completionStatus, levels.length), i => {
        Crafty.e('2D, DOM, Text, Mouse')
            .attr({x: 175, y: 235 + 50*i, w: 300, h: 50})
            .textColor('#525252')
            .textFont({family: 'XoloniumBold', size: '30px'})
            .text(`[Level ${i+1}]`)
            .bind('Click', () => {
                Crafty.scene('game', levels[i]);
            });
    });
});

Crafty.scene('game', function (levelJson) {
    levelBuilder(levelJson);
});

Crafty.scene('fail', function (levelJson) {
    backgroundGrid();

    Crafty.e('2D, DOM, Text')
        .attr({x: 100, y: 100, w: 400, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '50px'})
        .text('Game over!');

    Crafty.e('2D, DOM, Text')
        .attr({x: 150, y: 200, w: 500, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '30px'})
        .text(`Level ${levelJson.meta.level} failed`);

    Crafty.e('2D, DOM, Text, Mouse')
        .attr({x: 200, y: 350, w: 500, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '30px'})
        .text(`[retry]`)
        .bind('Click', () => {
            Crafty.scene('game', levelJson);
        });

    Crafty.e('2D, DOM, Text, Mouse')
        .attr({x: 195, y: 400, w: 500, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '30px'})
        .text(`[menu]`)
        .bind('Click', () => {
            Crafty.scene('title');
        });
});

Crafty.scene('complete', function (levelJson) {
    backgroundGrid();

    Crafty.e('2D, DOM, Text')
        .attr({x: 100, y: 100, w: 300, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '50px'})
        .text('Well done!');

    Crafty.e('2D, DOM, Text')
        .attr({x: 100, y: 200, w: 500, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '30px'})
        .text(`Level ${levelJson.meta.level} completed`);

    Crafty.e('2D, DOM, Text, Mouse')
        .attr({x: 170, y: 350, w: 500, h: 100})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '30px'})
        .text(`[continue]`)
        .bind('Click', () => {
            Crafty.scene('title');
        });

    if (levelJson.meta.level >= completionStatus) {
        completionStatus += 1;
    }
});

Crafty.init(500, 500, 'stage');
Crafty.viewport.clampToEntities = false;

Crafty.background("#f1eded");

completionStatus = 1;
Crafty.scene('title');
