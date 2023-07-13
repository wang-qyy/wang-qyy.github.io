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

function createDesc(attr, box) {}

$(function () {
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

    const title = `<h1 class='title'>形状：${item?.shape} (${
      text[item.shape]
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
