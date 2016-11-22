
/*jshint browser: true */
const _ = require('underscore');
const Crafty = require('craftyjs');


Crafty.c('Static', {
    required: '2D',
    fixedAt ({x, y}) {
        this.attr({__x: x, __y: y});
        this._reposition();
        Crafty.bind('ViewportScroll', () => this._reposition());
        return this;
    },
    _reposition () {
        this.attr({
            x: this.__x - Crafty.viewport._x,
            y: this.__y - Crafty.viewport._y
        });
    }
});

const createInfoWidget = function (entity, iconType) {
    let icon = Crafty.e(iconType)
        .attr({x: 0, y: 0, w: 50, h: 50});

    let text = Crafty.e('2D, Canvas, Text')
        .attr({x: 55, y: 10, w: 100, h: 50, z: 50})
        .textColor('#525252')
        .textFont({family: 'XoloniumBold', size: '25px'})
        .text('');

    entity._icon = icon;
    entity._text = text;
    entity.attach(entity._icon);
    entity.attach(entity._text);
};

Crafty.c('Goal', {
});

Crafty.c('TimerGoal', {
    required: '2D, Goal, Delay',
    init () {
        this._timeout = false;
        createInfoWidget(this, 'ClockGraphic');
    },
    goal ({minute = 0, second = 0}) {
        this.remaining = minute * 60 + second;
        this._updateText();
        this.delay(() => {
            this._updateText();
            Crafty.trigger('ClockTick', this.remaining);
            this.remaining -= 1;
        }, 1000, this.remaining, () => {
            this._timeout = true;
            Crafty.trigger('LevelFail');
        });
        return this;
    },
    _updateText () {
        this._text.text(`${this.remaining}`);
    },
    fulfilled () {
        return !this._timeout;
    }
});

Crafty.c('CoinsGoal', {
    required: '2D, Goal',
    init () {
        this._amount = 0;
        this._amountTarget = 0;

        createInfoWidget(this, 'CoinGraphic');
        Crafty.bind('GetCoins', ({value}) => {
            this._amount += value;
            this._updateText();
        });
    },
    goal ({amount}) {
        this._amountTarget = amount;
        this._updateText();
        return this;
    },
    _updateText() {
        this._text.text(`${this._amount}/${this._amountTarget}`);
    },
    fulfilled () {
        return this._amount >= this._amountTarget;
    }
});

Crafty.c('ItemsGoal', {
    required: '2D',
    goal (itemGoals) {
        _.each(itemGoals, (g, i) => {
            this.attach(Crafty.e('ItemGoal').goal(g).attr({y: i*50}));
        });
        return this;
    },
});

Crafty.c('ItemGoal', {
    required: '2D, Goal',
    init () {
        this._amount = 0;
        this._amountTarget = 0;
        this._targetType = '';

        createInfoWidget(this, 'OreGraphic');
        this._icon.origin('center')
            .requires('AngularMotion')
            .vrotation = 5;

        Crafty.bind('GetOre', ({type}) => {
            if (this._targetType === type) {
                this._amount += 1;
                this._updateText();
            }
        });
    },
    goal ({color, type, amount}) {
        this._icon.color(color);
        this._targetType = type;
        this._amountTarget = amount;
        this._updateText();
        return this;
    },
    _updateText() {
        this._text.text(`${this._amount}/${this._amountTarget}`);
    },
    fulfilled () {
        return this._amount >= this._amountTarget;
    }
});
