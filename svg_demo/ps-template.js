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
        svg_obj: [
            {
                type: "path",
                d: "M 218.2,804.7 C 70.7,698.1 37.6,492.1 144.2,344.6 C 250.8,197.1 456.8,164 604.2,270.6 C 751.7,377.2 784.9,583.2 678.3,730.6 C 571.7,878.1 365.7,911.3 218.2,804.7 Z",
                operation: "exclude",
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


function renderSvgDom() {
    const svgAsset = document.getElementById("svgAsset");

    const svgDom = createSvg("svg");
    svgDom.setAttribute(
        "viewBox",
        `0 0 ${asset.attribute.width} ${asset.attribute.height}`
    );
    svgDom.setAttribute("fill", `pink`);

    asset.attribute.svg_obj.forEach((shape, index) => {
        var shapeDom = createSvg(shape.type);
        shapeDom.setAttribute("d", shape.d);
        shapeDom.setAttribute(
            "fill",
            `rgba(${colors[index].r},${colors[index].g},${colors[index].b},${colors[index].a})`
        );

        svgDom.appendChild(shapeDom);
    });

    svgAsset.appendChild(svgDom);
}


function renderCanvasSvg() {
    var svgAssetCanvas = new fabric.Canvas("svgAssetCanvas"); // 创建画布对象

    var pathObject = new fabric.Path("M 100, 100 m 75, 0 a 75,75 0 1,0 -150,0 a 75,75 0 1,0  150,0"); // 创建路径对象
    pathObject.set({ fill: 'pink', left: 0, top: 0, })

    svgAssetCanvas.add(pathObject)
    // asset.attribute.svg_obj.forEach((path) => {
    //     var pathObject = new fabric.Path(path.d); // 创建路径对象
    //     pathObject.set({ fill: `rgba(${colors[index].r},${colors[index].g},${colors[index].b},${colors[index].a})` });
    //     svgAssetCanvas.add(pathObject);
    // });
}

$(function () {
    renderSvgDom()
    renderCanvasSvg()

});
