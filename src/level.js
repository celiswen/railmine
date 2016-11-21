
module.exports = {
    goal: {
        timer: {minute: 1, second: 30},
        coins: {amount: 100},
        items: [
            {color: 'red', type: 'iron', amount: 2},
            {color: 'blue', type: 'sliver', amount: 1},
        ],
    },

    player: {
        ship: {
            accelerator: 60,
            brake: -150,
            speedLimit: 500
        },
        hook: {
            launchSpeed: 150,
            reachLimit: 150,
        },
    },

    map: {
        nodes: {
            A: [0, 0],
            B: [300, -250],
            C: [300, 0],
            D: [300, 250],
            E: [600, -250],
            F: [600, 250],
            G: [900, -250],
            H: [900, 0],
            I: [900, 250],
            J: [1200, -500],
            K: [1200, -250],
            L: [1200, 0],
            A1: [0, -250],
        },
        paths: {
            A: ['C'],
            B: ['E'],
            C: ['B', 'D'],
            D: ['F'],
            E: ['G', 'H'],
            F: ['H', 'I'],
            G: ['K'],
            H: ['L'],
            I: ['L'],
            J: [],
            K: ['J'],
            L: ['K'],
            A1: ['B'],
        },
        start: ['A', 'A1'],

        ores: [
            {
                size: 1.5,
                weight: 0.5,
                value: 10,
                color: 'red',
                type: 'iron',
                at: {x: 300, y: -300}
            },
            {
                size: 1.5,
                weight: 0.5,
                value: 10,
                color: 'red',
                type: 'iron',
                at: {x: 350, y: -300}
            },
            {
                size: 1.5,
                weight: 0.5,
                value: 10,
                color: 'red',
                type: 'iron',
                at: {x: 400, y: -300}
            },
            {
                size: 1.5,
                weight: 0.5,
                value: 10,
                color: 'blue',
                type: 'sliver',
                at: {x: 550, y: -300}
            },
        ],

        sentinels: [
            {
                detectRange: 150,
                color: '#000000',
                speed: 200,
                at: {x: 400, y: 50}
            }
        ],
    },
};
