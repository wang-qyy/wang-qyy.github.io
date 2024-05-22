

// 读取第一个SVG文件


d3.xml(svg1).get(function (error, doc1) {
    if (error) throw error;

    // 读取第二个SVG文件
    d3.xml(svg2).get(function (error, doc2) {
        if (error) throw error;

        // 创建一个新的SVG元素来保存差集结果
        var diffSvg = d3.select("body").append("svg")
            .attr("width", 500)
            .attr("height", 500);

        // 遍历第一个SVG的所有元素，如果元素在第二个SVG中不存在，就将其添加到差集结果中
        d3.selectAll(doc1.documentElement.childNodes).each(function () {
            var found = d3.select(doc2).select(this.nodeName).data();
            if (found.length === 0) {
                diffSvg.node().appendChild(this);
            }
        });
    });
});