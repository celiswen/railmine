
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');
const assert = require('assert');

const util = require('./util');
require('./shapes');

const expect = require('chai').expect;
const vec2 = require('./util').vec2;


const advance = function ({node, next, offset}, step) {
    /*jshint expr: true */
    expect(node).to.be.not.undefined;
    expect(next).to.be.not.undefined;
    expect(offset).to.be.not.undefined;

    let length = vec2.lengthTo(node, next);
    if (offset + step >= length) {
        // about to reach terminal node
        if (next.nextNode() === undefined) {
            return {node: next, next: undefined, offset: 0};
        }
        return advance({node: next, next: next.nextNode(), offset: 0},
                       step + offset - length);
    } else {
        return {node, next, offset: offset + step};
    }
};

Crafty.c('Node', {
    required: '2D',
    _activePath: '#000000',
    _inactivePath: '#666666',
    init () {
        this._nextNodes = [];
        this._nextPtr = 0;

        this._pathEntities = [];

        this._nodeGraphic = Crafty.e('NodeGraphic')
            .attr({x: 0, y: 0, w: 50, h: 50});
        this.attach(this._nodeGraphic);

        this._updateGraphics();

        this.bind('SwitchPath', this.switchPath);
    },
    connect (nextNode) {
        expect(nextNode).to.be.not.equal(this);
        let color = this._nextNodes.length ? this._inactivePath : this._activePath;
        this._nextNodes.push(nextNode);
        this._pathEntities.push(Crafty.e('PathGraphic')
            .path(this._nodeGraphic, nextNode._nodeGraphic)
            .color(color));
    },
    nextNode () {
        return this._nextNodes[this._nextPtr];
    },
    switchPath () {
        if (this._nextNodes.length > 0) {
            this._nextPtr = (this._nextPtr + 1) % this._nextNodes.length;
            this._updateGraphics();
        }
    },
    vec2 () {
        return [this.x, this.y];
    },
    _updateGraphics () {
        this._nodeGraphic.attr({x: this.x - 25, y: this.y - 25, w: 50, h: 50});

        _.each(this._pathEntities, (entity, index) => {
            entity.path(this._nodeGraphic, this._nextNodes[index]._nodeGraphic)
                .color(index === this._nextPtr ?
                       this._activePath :
                       this._inactivePath);
        });
    },

    events: {
        Move () {
            this._updateGraphics();
        }
    }
});

const shipHitBox = function () {
    let back = -28;
    let mid = 0;
    let front = 30;
    let width = 18;
    return [back, -width, mid, -width, front, 0, mid, width, back, width];
};


Crafty.c('Ship', {
    required: '2D, Keyboard, Collision',
    init () {
        this._accelerator = 60;
        this._brake = -150;
        this._speedLimit = 200;

        this.collision(shipHitBox());

        this._a = 0;
        this._v = 0;

        this._position = {node: undefined, next: undefined, offset: 0};
        this._shipGraphic = Crafty.e('ShipGraphic')
            .attr({x: this.x - 50, y: this.y - 25, w: 100, h: 50});
        this.origin('center');
        this.attach(this._shipGraphic);
    },
    ship ({accelerator, brake, speedLimit}) {
        this._accelerator = accelerator;
        this._brake = brake;
        this._speedLimit = speedLimit;
        return this;
    },
    startAt (node) {
        this._position = {node: node, next: node.nextNode(), offset: 0};
        this.advance(0);
        return this;
    },
    _move (step) {
        if (this._hasStopped()) return;
        let {node, next, offset} = this._position = advance(this._position, step);
        if (next === undefined) return;
        let [x, y] = vec2.add(node, vec2.valueLerp(node, next, offset));
        this.attr({x: x, y: y});
    },
    _alignTrack () {
        /*jshint expr: true */
        if (!this._hasStopped()) {
            let [x, y] = vec2.valueLerp(this._position.node, this._position.next, 1);
            this.rotation = util.rad(Math.atan2(y, x));
            expect(this.rotation).to.be.not.NaN;
        }
    },
    _hasStopped () {
        return this._position.next === undefined;
    },
    advance (step) {
        this._move(step);
        this._alignTrack();
        if (this._hasStopped()) {
            Crafty.trigger('ShipStop');
        }
    },

    events: {
        EnterFrame ({frame, dt}) {
            this._a = this.isDown('SPACE') ? this._accelerator : this._brake;
            this._v += dt/1000 * this._a;
            this._v = Math.max(0, Math.min(this._speedLimit, this._v));
            this.advance(this._v * dt/1000);
        },
    }
});

const hookHitBox = function (hookEntity) {
    return _.map([0, -0.3, 0.35, -0.3, 0.35, 0.3, 0, 0.3], i => i * 50);
};

Crafty.c('Hook', {
    required: '2D, Mouse, Collision',
    init () {
        this._launchSpeed = 150;
        this._reachLimit = 150;

        this._depth = 0;
        this._hookState = 0;
        this._oreGrabbed = null;

        this.collision(hookHitBox(this));

        this._mouseHandler = Crafty.e('2D, Mouse')
            .attr({x: this.x - 300, y: this.y - 300, w: 600, h: 600})
            .bind('MouseMove', e => this._updateRotation())
            .bind('Click', e => {
                if (this._hookState === 0) {
                    this._hookState = 1;
                }
            });
        this.attach(this._mouseHandler);

        this._hookGraphic = Crafty.e('HookGraphic')
            .attr({x: this.x - 25, y: this.y - 25, w: 50, h: 50});
        this.attach(this._hookGraphic);
    },
    hook ({launchSpeed, reachLimit}) {
        this._launchSpeed = launchSpeed;
        this._reachLimit = reachLimit;
        return this;
    },
    _setHookPosition (depth) {
        let angle = util.deg2rad(this.rotation);
        this._depth = depth;
        this.attr({
            x: this._ship.x + depth * Math.cos(angle),
            y: this._ship.y + depth * Math.sin(angle)
        });

        this._pathGraphic.recalculate();
    },
    _updateRotation () {
        if (!Crafty.lastEvent) return;
        let [realX, realY] = [Crafty.lastEvent.realX, Crafty.lastEvent.realY];
        if (this._depth === 0) {
            let [x, y] = vec2.sub([realX, realY], [this.x, this.y]);
            this.rotation = util.rad(Math.atan2(y, x));
        }
    },
    attachTo (ship) {
        this._pathGraphic = Crafty.e('PathGraphic')
            .attr('z', 30)
            .path(ship, this);

        this._ship = ship;
        this.attr({x: ship.x, y: ship.y});
        ship.bind('Move', e => {
            this._updateRotation();
            this._setHookPosition(this._depth);
        });
    },
    events: {
        EnterFrame ({dt}) {
            let launchSpeed = this._launchSpeed;
            if (this._oreGrabbed) {
                launchSpeed *= this._oreGrabbed._weight;
            }

            let dis = this._depth + launchSpeed * this._hookState * dt/1000;
            if (dis >= this._reachLimit) {
                this._setHookPosition(this._reachLimit);
                this._hookState = -1;
            } else if (dis < 0) {
                this._setHookPosition(0);
                this._hookState = 0;
                this.trigger('HookReturn');
            } else {
                this._setHookPosition(dis);
            }
        }
    }
});

const oreHitBox = function (oreEntity) {
    let r = oreEntity.w / 2 ;
    return _.flatten(_.times(3, i => {
        return vec2.add([r, r], util.rotate([r/2, 0], util.deg2rad(120 * i)));
    }), true);
};

Crafty.c('Ore', {
    required: 'AngularMotion, OreGraphic, Collision',
    init () {
    },
    ore ({size, weight, value, color, type}) {
        this._size = size;
        this._weight = weight;
        this._value = value;
        this._type = type;

        this.attr({w: 50 * size, h: 50 * size});
        this.origin('center');
        this.color(color);
        this.vrotation = 40 * this._weight;
        this.collision(oreHitBox(this));
        this.checkHits("Hook");

        return this;
    },
    centerAt ({x, y}) {
        return this.attr({x: x - this.w/2, y: y - this.h/2});
    },
    events: {
        HitOn (hits) {
            let {obj: hook} = hits[0];
            if (hook._oreGrabbed) return;

            hook.attach(this);
            hook._hookState = -1;
            hook._oreGrabbed = this;
            this.centerAt({x: hook.x, y: hook.y});
            this.vrotation = 0;

            hook.one('HookReturn', () => {
                Crafty.trigger('GetOre', {type: this._type});
                Crafty.trigger('GetCoins', {value: this._value});
                hook._oreGrabbed = null;
                hook.detach(this);
                this.destroy();
            });
        }
    }
});

const sentinelHitBox = function () {
    return _.flatten(_.times(4, i => {
        return vec2.add([25, 25], util.rotate([10, 0], util.deg2rad(90 * i)));
    }));
};

Crafty.c('Sentinel', {
    required: 'Motion, AngularMotion, SentinelGraphic, Collision, SolidHitBox',
    init () {
    },
    sentinel ({detectRange, speed}) {
        this.attr({w: 50, h: 50});
        this._detectRange = detectRange;
        this._speed = speed;
    this.collision(sentinelHitBox());

        this.checkHits('Ship, Hook');
        this.origin('center');
        return this;
    },
    centerAt ({x, y}) {
        return this.attr({x: x - this.w/2, y: y - this.h/2});
    },
    events: {
        EnterFrame () {
            let ship = Crafty('Ship');
            let target = [ship.x, ship.y];
            let senti = [this.x + this.w/2, this.y + this.h/2];
            if (vec2.lengthTo(senti, target) <= this._detectRange) {
                let speedVec = vec2.valueLerp(senti, target, 1);
                [this.vx, this.vy] = vec2.mul(speedVec, this._speed);
                this.vrotation = 360;
            } else {
                this.vx = this.vy = this.vrotation = 0;
            }
        },
        HitOn (hits) {
            let {obj} = hits[0];

            if (obj.has('Ship')) {
                Crafty.trigger('GameOver');
                this.destroy();
            } else if (obj.has('Hook')) {
                if (obj._hookState != 1) return;
                this.destroy();
            } else {
                assert(false);
            }
        }
    }
});
