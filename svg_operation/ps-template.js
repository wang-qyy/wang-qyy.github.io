const asset = {
    meta: { type: "svg", id: 6 },
    transform: {
        zindex: 6,
        horizontalFlip: false,
        verticalFlip: false,
        rotate: 0,
        posX: 852,
        posY: 78,
    },
    attribute: {
        width: 966,
        height: 913,
        dropShadow: {
            blur: 29.0,
            color: { r: 0, g: 39, b: 148, a: 0.43 },
            spread: 0,
            x: -0.33416538263076073,
            y: -8.482630091024259,
            blend_mode: "Mltp",
        },
        color: { r: 79, g: 125, b: 255, a: 1.0 },
        initail_fill_rule: 0,

        //默认为union  合并形状填充形状内部  exclude排查重叠形状   subtract减去顶层形状   intersect与形状区域相交

        svg_obj: [
            {
                type: "path",
                d: "M 218.2,804.7 C 70.7,698.1 37.6,492.1 144.2,344.6 C 250.8,197.1 456.8,164 604.2,270.6 C 751.7,377.2 784.9,583.2 678.3,730.6 C 571.7,878.1 365.7,911.3 218.2,804.7 Z",
                operation: "exclude",
                fill: {
                    r: 255, //0-255
                    g: 255,
                    b: 255,
                    a: 1, //0-1 可以不传 默认为1 最终计算 a*opacity
                },
            },
            {
                type: "path",
                d: "M 283.7,714 C 186.3,643.6 164.4,507.5 234.8,410.1 C 305.2,312.7 441.3,290.8 538.7,361.2 C 636.2,431.6 658.1,567.7 587.7,665.1 C 517.2,762.6 381.1,784.5 283.7,714 Z",
                operation: "exclude",
            },
            {
                type: "path",
                d: "M 706,878.4 C 706,878.4 1.7,369.3 1.7,369.3 C 1.7,369.3 259.8,1.8 259.8,1.8 C 259.8,1.8 964,510.9 964,510.9 C 964,510.9 706,878.4 706,878.4 Z",
                operation: "subtract",
                fill: {
                    "type": "radial",
                    "colorStops": [
                        {
                            "color": {
                                "r": 255,
                                "g": 255,
                                "b": 255,
                                "a": 1
                            },
                            "offset": 0
                        },
                        {
                            "color": {
                                "r": 0,
                                "g": 0,
                                "b": 0,
                                "a": 1
                            },
                            "offset": 1
                        }
                    ],
                    "coords": {
                        "x1": 0,
                        "y1": 0.3420201433256687,
                        "x2": 0.9396926207859084,
                        "y2": 0
                    },
                    "angle": 20
                },
                "stroke-opacity": 1.0,//透明度 0-1 可以不传 默认1
                //stroke 边框
                "stroke": {
                    "r": 255,//0-255
                    "g": 25,
                    "b": 255,
                    "a": 1,//0-1 可以不传 默认为1 最终计算 a*stroke-opacity
                },
                "stroke-width": 4.0,//轮廓的宽度
                "stroke-linejoin": "miter",//bevel 用斜角连接路径段; miter 用尖角连接路径段;round 使用圆角连接路径片段
                "stroke-linecap": "butt",//butt 线条的两端为平行的边缘 round向线条的两端添加半圆形线帽 square向线条的两端添加正方形线帽
                "stroke-dasharray": "1,0,6"
            },
            {
                type: "path",
                d: "M 607.8,893.2 C 607.8,893.2 524.6,867.8 524.6,867.8 C 524.6,867.8 583.4,675.6 583.4,675.6 C 583.4,675.6 666.6,701 666.6,701 C 666.6,701 607.8,893.2 607.8,893.2 Z",
                operation: "subtract",
            },
            {
                type: "path",
                d: "M 11,462.3 C 11,462.3 61.1,533.2 61.1,533.2 C 61.1,533.2 224.9,417.2 224.9,417.2 C 224.9,417.2 174.8,346.3 174.8,346.3 C 174.8,346.3 11,462.3 11,462.3 Z",
                operation: "subtract",
                fill: {
                    type: "linear",
                    angle: 20,
                    colorStops: [
                        {
                            color: {
                                r: 255,
                                g: 255,
                                b: 255,
                                a: 1,
                            },
                            offset: 0.12,
                        },
                        {
                            color: {
                                r: 0,
                                g: 0,
                                b: 0,
                                a: 1,
                            },
                            offset: 1,
                        },
                    ],
                    coords: {
                        x1: 0,
                        y1: 0.3420201433256687,
                        x2: 0.9396926207859084,
                        y2: 0,
                    },
                },
            },
        ],
    },
};

const colors = [
    { r: 0, g: 39, b: 148, a: 0.43 },
    { r: 79, g: 125, b: 255, a: 1.0 },
    { r: 79, g: 0, b: 255, a: 1.0 },
    { r: 79, g: 0, b: 30, a: 1.0 },
    { r: 79, g: 0, b: 20, a: 1.0 },
];

function RGBAToString(RGBA) {
    const { r, g, b, a = 1 } = RGBA;
    if (a !== undefined) {
        return `rgba(${r},${g},${b},${a})`;
    }
    return `rgba(${r},${g},${b})`;
}


function createSvg(nodeName) {
    return document.createElementNS("http://www.w3.org/2000/svg", nodeName);

    
}

function createNode(data, parent) {
    data.attributes.forEach((attr) => {
        var shapeDom = createSvg(data.shape);

        Object.keys(attr).forEach((attrName) => {
            shapeDom.setAttribute(attrName, attr[attrName]);
        });

        // 通用属性
        Object.keys(baseAttribute).forEach((attr) => {
            shapeDom.setAttribute(attr, baseAttribute[attr]);
        });

        parent.appendChild(shapeDom);
    });
}

function getPathFill(svgDom, fill) {
    if (fill.type) {
        let id = `${fill.type}-${new Date().getTime()}`
        const gradientDom = createSvg(`${fill.type}Gradient`)
        gradientDom.setAttribute('id', id)
        gradientDom.setAttribute('x1', fill.coords.x1)
        gradientDom.setAttribute('x2', fill.coords.x2)
        gradientDom.setAttribute('y1', fill.coords.y1)
        gradientDom.setAttribute('y2', fill.coords.y2)

        fill.colorStops.forEach(stops => {
            const colorStops = createSvg('stop')
            colorStops.setAttribute('offset', stops.offset)
            colorStops.setAttribute('stop-color', RGBAToString(stops.color))
            gradientDom.appendChild(colorStops)
        })
        svgDom.prepend(gradientDom)

        return `url(#${id})`
    } else {

        return fill
    }

}

function renderSvgDom() {
    const svgAsset = $("#svgAsset");
    svgAsset.css({
        width: asset.attribute.width,
        height: asset.attribute.height,
    });

    const svgDom = createSvg("svg");
    svgDom.setAttribute(
        "viewBox",
        `0 0 ${asset.attribute.width} ${asset.attribute.height}`
    );
    svgDom.setAttribute("fill", `pink`);

    asset.attribute.svg_obj.forEach((shape, index) => {
        var shapeDom = createSvg(shape.type);
        Object.keys(shape).forEach(attr => {
            if (!['type', 'operation'].includes(attr)) {
                switch (attr) {
                    case 'fill': {
                        const fill = getPathFill(svgDom, shape.fill)
                        shapeDom.setAttribute('fill', fill);
                        break;
                    }
                    case 'stroke': {
                        let stroke;
                        if (typeof shape.stroke === 'string') {
                            stroke = shape.stroke
                        } else {
                            stroke = RGBAToString(shape.stroke)
                        }
                        shapeDom.setAttribute('stroke', stroke);
                        break;
                    }
                    default: {
                        shapeDom.setAttribute(attr, shape[attr]);
                    }



                }
            }
        })
        svgDom.appendChild(shapeDom);
    });

    svgAsset.append(svgDom);

    const svgString = new XMLSerializer().serializeToString(svgDom);

    console.log({ svgString });

}

$(function () {
    renderSvgDom();
});
