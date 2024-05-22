const baseAttribute = {
    fill: "pink",
    stroke: "#000",
    "stroke-width": 10,
    "stroke-linecap": "round",
    "stroke-dasharray": "60 60",
    "stroke-linejoin": "round",
};

const shapes = [
    {
        shape: "rect",
        title: "矩形",
        attributes: [
            {
                x: 150,
                y: 150,
                width: 300,
                height: 300,
                rx: 50,
                ry: 50,
            },
        ],

        desc: {},
    },
    ,
    {
        shape: "circle",
        attributes: [
            {
                cx: 300,
                cy: 300,
                r: 150,
            },
        ],
    },

    {
        shape: "ellipse",
        attributes: [
            {
                cx: 300,
                cy: 300,
                rx: 100,
                ry: 200,
            },
        ],
    },

    {
        shape: "line",
        attributes: [
            {
                x1: 0,
                y1: 0,
                x2: 600,
                y2: 600,
            },
        ],
    },

    {
        shape: "polyline",
        attributes: [
            {
                points:
                    "15,15 15,100 100,100 100,200 200,200 200,300 300,300 300,400 400,400 400,500 500,500 500,580 580,580",
            },
        ],
    },

    {
        shape: "polygon",
        attributes: [
            {
                points: "15,15 15,100 100,150 100,200 200,200",
            },
            {
                points: "300,300 500,100 550,550",
            },
        ],
    },

    //   {
    //     shape: "path",
    //     attributes: [
    //       {
    //         d: "M150 0 L75 200 L225 200 Z",
    //       },
    //     ],
    //   },
];