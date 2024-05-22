

const svg1 = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><rect x="0" y="0" width="130" height="130" fill="red" /></svg>`
const svg2 = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 218 218"><circle fill="#20C4CB" cx="0" cy="0" r="100" /></svg>`


function render() {
    var canvas = new fabric.Canvas('canvas');

    // 创建两个 Fabric.js 画布
    var canvas1 = new fabric.Canvas('canvas1');
    var canvas2 = new fabric.Canvas('canvas2');

    // 加载第一个 SVG 图像
    fabric.loadSVGFromString(svg1, function (objects, options) {
        objects.forEach(function (obj) {
            canvas1.add(obj);
        });
    });

    // 加载第二个 SVG 图像
    fabric.loadSVGFromString(svg2, function (objects, options) {
        // var obj2 = fabric.util.enlivenObjects(objects, options);
        objects.forEach(function (obj) {
            canvas2.add(obj);
        });
    });

    // 比较两个画布上的对象，并计算差集
    var differenceObjects = [];
    canvas2.forEachObject(function (object) {
        if (!canvas1.contains(object)) {
            console.log('contains', object);
            differenceObjects.push(object);
        }
    });

    // 将差集渲染到第一个画布上
    console.log(differenceObjects);

    differenceObjects.forEach(obj => {
        canvas.add(obj);
    })
    canvas.renderAll();
}

function calcPath() {
    const svg = d3.select("body")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500);

    const circle1 = svg.append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 50)
        .attr("fill", "red");

    const circle2 = svg.append("circle")
        .attr("cx", 150)
        .attr("cy", 150)
        .attr("r", 50)
        .attr("fill", "blue");

    // 获取两个圆的交集部分
    // const intersection = Intersection.intersectShapes(circle1, circle2);
    const intersection = d3.intersectShapes(circle1, circle2);


    console.log(intersection);
    // return

    // 将交集部分绘制到 SVG 元素上
    intersection.each(function (d, i) {
        if (i === 0) {
            d3.select(this)
                .attr("cx", d.x)
                .attr("cy", d.y)
                .attr("r", d.r);
        } else {
            d3.select(this).remove(); // 如果交集部分有多个元素，则删除其他元素
        }
    });
}

function fileReader() {

    console.log('fileReader');
    var file = new File("./test.psd");
    if (file.exists) {
        // 打开PSD文件
        var doc = open(file);
        // 遍历所有图层
        for (var i = 0; i < doc.layers.length; i++) {
            var layer = doc.layers[i];

            // 检查图层是否包含路径信息
            if (layer.kind == LayerKind.VECTOR) {
                // 遍历图层中的所有路径
                for (var j = 0; j < layer.vectorMask.pathItems.length; j++) {
                    var pathItem = layer.vectorMask.pathItems[j];

                    // 输出路径信息
                    alert("Path " + (j + 1) + " in layer " + layer.name + ":\n" +
                        "Number of subpaths: " + pathItem.subPathItems.length);

                    // 遍历所有子路径（线段或曲线）
                    for (var k = 0; k < pathItem.subPathItems.length; k++) {
                        var subPath = pathItem.subPathItems[k];

                        // 根据子路径的类型输出不同的信息
                        if (subPath.kind == SubPathKind.CLOSED) {
                            alert("Closed subpath with " + subPath.anchorCount + " anchors.");
                        } else if (subPath.kind == SubPathKind.OPEN) {
                            alert("Open subpath with " + subPath.anchorCount + " anchors.");
                        }

                        // 遍历所有锚点
                        for (var l = 0; l < subPath.anchorCount; l++) {
                            var anchor = subPath.anchors[l];

                            // 输出锚点位置
                            alert("Anchor " + (l + 1) + ": (" + anchor.position[0] + ", " + anchor.position[1] + ")");

                            // 如果锚点有方向线，输出方向线信息
                            if (anchor.inOutPoints[0].kind != AnchorPointKind.CUSP && anchor.inOutPoints[1].kind != AnchorPointKind.CUSP) {
                                alert("In point: (" + anchor.inOutPoints[0].anchor[0] + ", " + anchor.inOutPoints[0].anchor[1] + ")");
                                alert("Out point: (" + anchor.inOutPoints[1].anchor[0] + ", " + anchor.inOutPoints[1].anchor[1] + ")");
                            }
                        }
                    }
                }
            }
        }

        // 关闭文档
        doc.close(SaveOptions.DONOTSAVECHANGES);
    } else {
        alert("File does not exist.");
    }
}
$(function () {
    // render();
    calcPath()
    fileReader()
})