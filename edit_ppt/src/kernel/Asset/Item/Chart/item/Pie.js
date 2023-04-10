import React, { Component } from 'react';
import * as d3 from 'd3';

class Pie extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 绘制饼图
   */
  drawPie() {
    const { asset, canvas } = this.props;
    const { attribute } = asset;
    const { chartDrawInfo } = attribute;
    const canvasScale = canvas.scale;
    const th = this;

    /* 基础数据计算 START */
    const WHMin =
      attribute.width > attribute.height ? attribute.height : attribute.width; // 最小边计算

    const radius = WHMin * chartDrawInfo.outerRadius; // 内半径大小
    const innerRadius = WHMin * chartDrawInfo.innerRadius; // 外半径大小
    const piePosX = WHMin * chartDrawInfo.piePosX; // 饼图定位X（定位点是饼图的中心）
    const piePosY = WHMin * chartDrawInfo.piePosY; // 饼图定位Y（定位点是饼图的中心）
    const { labelsRadius } = chartDrawInfo; // labels定位半径（基于饼图外半径）
    const fontSize = WHMin * chartDrawInfo.fontSize;
    /* 基础数据计算 END */

    // 获取当前显示的className
    const assetClassName = asset.meta.className;

    // 清除svg
    d3.select(`.${assetClassName}`)
      .select('.drawSVGArea')
      .select('svg')
      .remove();
    // 创建svg
    const svg = d3
      .select(`.${assetClassName}`)
      .select('.drawSVGArea')
      .append('svg')
      .attr('width', asset.attribute.width)
      .attr('height', asset.attribute.height)
      .attr('transform-origin', '0 0')
      .attr('transform', `scale(${canvasScale})`)
      .style('background-color', 'none');
    // 模拟数据:
    let data = [];
    data = attribute.userData;
    const dataSet = data.map(function (d) {
      return d[1];
    });

    // 处理数据得到适合绘图数据
    const pie = d3.pie().value(function (d) {
      return d[1];
    })(data);
    // 构建绘制器
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
    const arc1 = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(1.2 * radius);
    const oArc = d3
      .arc()
      .innerRadius(1.2 * radius)
      .outerRadius(1.2 * radius);
    const outerArc = d3
      .arc()
      .innerRadius(1.3 * radius)
      .outerRadius(1.3 * radius);
    // 构建颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    // 创建path，并绘制
    const arcGroup = svg
      .append('g')
      .attr('transform', `translate(${piePosX}, ${piePosY})`)
      .selectAll('path')
      .data(pie)
      .enter();

    arcGroup
      .append('path')
      .attr('fill', function (d, i) {
        return th.getColorDomain({
          index: i,
          colorTable: attribute.colorTable,
        });
      })
      .attr('d', arc);
    // .append('title').text(function(d){
    //     return d.data[0];
    // });

    // arcGroup.append('text')
    // .attr("transform",function(d){ return "translate(" + arc.centroid(d) + ")";})
    // .attr("text-anchor","middle")
    // .attr("fill", "#333")
    // .text(function(d){
    //     return d.data[0];
    // });

    // 添加文字标签
    const labels = svg
      .append('g')
      .attr('transform', `translate(${piePosX}, ${piePosY})`)
      .attr('class', 'labels');

    const texts = labels
      .selectAll('text')
      .data(pie)
      .enter()
      .append('text')
      .attr('dy', '0.35em')
      .attr('fill', function (d, i) {
        return th.getColorDomain({
          index: i,
          colorTable: attribute.colorTable,
        });
      })
      .text(function (d, i) {
        return d.data[0];
      })
      .style('text-anchor', function (d, i) {
        return th.midAngel(d) < Math.PI ? 'start' : 'end';
      })
      .style('font-family', 'font130')
      .attr('transform', function (d, i) {
        // 找出外弧形的中心点
        const pos = arc.centroid(d);
        const outerArcPos = outerArc.centroid(d);
        // 改变文字标识的x坐标
        pos[0] =
          radius * (th.midAngel(d) < Math.PI ? labelsRadius : -labelsRadius);

        return `translate(${[pos[0], outerArcPos[1]]})`;
      })
      .style('opacity', 1)
      .attr('font-size', fontSize);

    const lines = svg
      .append('g')
      .attr('transform', `translate(${piePosX}, ${piePosY})`)
      .attr('class', 'polyline');

    const polylines = lines
      .selectAll('polyline')
      .data(pie)
      .enter()
      .append('polyline')
      .attr('points', function (d) {
        return [arc.centroid(d), arc.centroid(d), arc.centroid(d)];
      })
      .attr('points', function (d) {
        const pos = arc.centroid(d);
        const outerArcPos = outerArc.centroid(d);
        pos[0] =
          radius * (th.midAngel(d) < Math.PI ? labelsRadius : -labelsRadius);
        return [oArc.centroid(d), outerArcPos, [pos[0], outerArcPos[1]]];
      })
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', `${WHMin * 0.003}px`)
      .attr('stroke-dasharray', `${WHMin * 0.008}px`)
      .style('opacity', 0.5);
  }

  /**
   * 获取指定颜色表中的颜色
   */
  getColorDomain(props) {
    const index = props.index ? props.index : 0;
    const { colorTable } = props;
    let tempBrokenLineColor = 'rgba(0,0,0,1)';
    let nowColorTableNum = 0;
    const tempAreaAlpha = props.areaAlpha ? props.areaAlpha : 1;
    if (colorTable && colorTable.length > 0) {
      nowColorTableNum = index % colorTable.length;
      tempBrokenLineColor = `rgba(${colorTable[nowColorTableNum].r},${
        colorTable[nowColorTableNum].g
      },${colorTable[nowColorTableNum].b},${
        colorTable[nowColorTableNum].a * tempAreaAlpha
      })`;
    }

    return tempBrokenLineColor;
  }

  midAngel(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    // 绘制图表
    this.drawPie();

    const { asset } = this.props;
    if (!asset.rt_shotIsComplete) {
      this.props.LoadComplete();
    }
  }

  render() {
    return <div className="drawSVGArea" />;
  }
}

export default Pie;
