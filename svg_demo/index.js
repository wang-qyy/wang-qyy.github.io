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

function createDesc(attr, box) { }

const svg1 = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130">
<rect x="0" y="0" width="130" height="130" fill="red" />
</svg>`
const svg2 = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 218 218">
<circle fill="#20C4CB" cx="0" cy="0" r="100" />
</svg>`

const offsetX = 10;
const offsetY = 10

function operation() {
  var canvas1 = new fabric.Canvas('canvas1');
  var canvas2 = new fabric.Canvas('canvas2');

  // 加载第一个 SVG
  fabric.loadSVGFromString(svg1, function (objects) {
    objects.forEach(function (obj) {
      // obj.set({ left: obj.left + offsetX, top: obj.top + offsetY });
      canvas1.add(obj);
    });


  });
  // 加载第二个 SVG
  fabric.loadSVGFromString(svg2, function (objects) {
    objects.forEach(function (obj) {
      // obj.set({ left: obj.left + offsetX, top: obj.top + offsetY });
      canvas2.add(obj);
    });

    // 计算差集
    var diffObjects = [];
    for (var i = 0; i < canvas1._objects.length; i++) {

      console.log('计算差集', canvas1._objects[i].getCenterPoint());
      // if (!canvas2.containsPoint(canvas1._objects[i].getCenterPoint())) {
      //   diffObjects.push(canvas1._objects[i]);
      // }
    }

    // 输出结果
    console.log("差集对象", diffObjects);
  });

}

function operation1() {
  var canvas = new fabric.Canvas('canvas2');
  // 加载第一个 SVG
  fabric.loadSVGFromString(svg1, function (objects) {
    objects.forEach(function (obj) {
      // obj.set({ left: obj.left + offsetX, top: obj.top + offsetY });
      canvas.add(obj);
    });

    // 加载第二个 SVG
    fabric.loadSVGFromString(svg2, function (objects) {
      objects.forEach(function (obj) {
        // obj.set({ left: obj.left + offsetX, top: obj.top + offsetY });
        canvas.add(obj);
      });

      // 输出结果
      console.log("并集对象", canvas._objects);
    });
  });
}

function o2() {
  var canvas = new fabric.Canvas('canvas1'); // 创建画布对象
  // 从URL加载SVG并添加到画布上
  fabric.loadSVGFromString(svg1, function (objects) {
    var svgGroup = objects[0]; // SVG图形组合

    // 设置SVG图形组合的属性（位置、大小等）
    // svgGroup.set({ left: 50, top: 50 });

    // 将SVG图形组合添加到画布上
    canvas.add(svgGroup);
  });

  console.log(canvas.containsPoint);

  var paths = []; // 存放路径对象的数组
  var pathObject = new fabric.Path("M 100, 100 m 75, 0 a 75,75 0 1,0 -150,0 a 75,75 0 1,0  150,0"); // 创建路径对象
  pathObject.set({ fill: 'pink', left: 25, top: 25, })
  paths.push(pathObject); // 将路径对象添加到数组中

  // 将路径对象添加到画布上
  paths.forEach(function (path) {
    canvas.add(path);
  });
  // canvas.renderAll();
}


function o3() {
  // 假设你有两个SVG字符串
  var svgString1 = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
  var svgString2 = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue" /></svg>';

  // 解析SVG字符串为Fabric.js的图形对象
  var canvas = new fabric.Canvas('canvas1');
  var circle1 = fabric.util.enlivenObjects([fabric.parseSVGDocument(svgString1)], function (objects) {
    canvas.add(objects[0]);
  });

  var circle2 = fabric.util.enlivenObjects([fabric.parseSVGDocument(svgString2)], function (objects) {
    canvas.add(objects[0]);
  });

  // 计算差集（这里只是一个示例，实际上你可能需要更复杂的逻辑来计算差集）
  var difference = circle1.subtract(circle2);

  console.log(difference);

  // 将差集渲染到画布上
  canvas.add(difference);
}

$(function () {

  o3();
  // o2()
  // operation()
  // operation1()
  const main = document.getElementById("main");

  shapes.forEach((item) => {
    const box = document.createElement("div");
    box.setAttribute("class", "box");

    const svgDom = createSvg("svg");
    svgDom.setAttribute("viewBox", "0 0 600 600");

    createNode(item, svgDom);

    box.appendChild(svgDom);

    main?.appendChild(box);
    const detail = document.createElement("div");
    detail.setAttribute("class", "detail");

    const title = `<h1 class='title'>形状：${item?.shape} (${text[item.shape]
      })</h1>`;

    let arr = `<ul>`;

    Object.keys(item?.attributes[0]).forEach((key) => {
      const desc = text[`${item.shape}-${key}`] || text[key];
      arr += `<li>${key}：${desc}</li>`;
    });
    arr += `</ul>`;
    detail.innerHTML = title + arr;
    box?.appendChild(detail);
  });

  const generalAttr = document.createElement("div");
  generalAttr.setAttribute("class", "general");
  generalAttr.innerHTML = "<h1 class='title'>通用属性</h1>";

  Object.keys(baseAttribute).forEach((attr) => {
    const attrDom = document.createElement("div");

    attrDom.innerHTML = `${attr}：${text[attr]}`;
    generalAttr.appendChild(attrDom);
  });
  main?.appendChild(generalAttr);
});






