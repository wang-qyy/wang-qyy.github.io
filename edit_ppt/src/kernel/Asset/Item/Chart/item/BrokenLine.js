import React, { Component } from 'react';
import * as d3 from 'd3';

class BrokenLine extends Component {
  constructor(props) {
    super(props);
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

  /**
   * 绘制折线（初始化）
   * @param {*}
   */
  drawBrokenLine() {
    const { asset, canvas } = this.props;
    const canvasScale = canvas.scale;

    const { attribute } = asset;
    const { chartDrawInfo } = attribute;

    /* ========>> 图表数据计算 START <<======== */
    const WHMin =
      attribute.width > attribute.height ? attribute.height : attribute.width;
    // 文字大小
    const fontSize = WHMin * chartDrawInfo.fontSize;
    // 文字颜色
    const fontColor = `rgba(${chartDrawInfo.fontColor.r},${chartDrawInfo.fontColor.g},${chartDrawInfo.fontColor.b},${chartDrawInfo.fontColor.a})`;
    const axisXTextY = WHMin * chartDrawInfo.axisXTextY;
    const axisYTextX = WHMin * chartDrawInfo.axisYTextX;
    // Y坐标轴X坐标
    const axisYX = attribute.width * chartDrawInfo.axisPosX;
    // Y坐标轴Y坐标
    const axisYY = attribute.height * chartDrawInfo.axisPosY;
    const axisXX = attribute.width * chartDrawInfo.axisPosX;
    const axisXY =
      attribute.height * (chartDrawInfo.axisPosY + chartDrawInfo.axisYHeight);
    const brokenLineWidth = WHMin * chartDrawInfo.brokenLineWidth;
    const axisXWidth = attribute.width * chartDrawInfo.axisXWidth;

    let axisYStrokeDasharray = 'none';
    const brokenLineFill = 'none';
    if (chartDrawInfo.axisYStrokeDasharray) {
      axisYStrokeDasharray = '';
      chartDrawInfo.axisYStrokeDasharray.map((item, index) => {
        if (index > 0) {
          axisYStrokeDasharray += ',';
        }
        axisYStrokeDasharray += attribute.width * item;
      });
    }
    // //折线颜色填充
    // if( chartDrawInfo.brokenLineFill ){
    //     brokenLineFill = "rgba(" + chartDrawInfo.brokenLineFill.r + "," + chartDrawInfo.brokenLineFill.g + "," + chartDrawInfo.brokenLineFill.b + "," + chartDrawInfo.brokenLineFill.a + ")";
    // }
    /* ========>> 图表数据计算 END <<======== */

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
    const dataX = [];
    const dataY = [];
    let dataZ = [];
    const dataYSortMap = [];
    // 用户数据
    if (attribute.userData) {
      attribute.userData.map((item, index) => {
        if (attribute.chartRule && attribute.chartRule.isFirstTitle) {
          // 第1行是标题
          if (index == 0) {
            // 获取第一行字段
            dataZ = [...item];
            dataZ = dataZ.slice(1, dataZ.length);
            dataZ.map((subItem, subIndex) => {
              dataY.push([]);
            });
          } else {
            // 获取详细数据
            dataZ.map((subItem, subIndex) => {
              dataY[subIndex].push(item[subIndex + 1]);
            });
            dataX.push(item[0]);
          }
        } else {
          if (index == 0) {
            dataY.push([]);
          }
          // 第1行不是是标题
          dataY[0].push(item[1]);
          dataX.push(item[0]);
        }
      });
      dataY.map((item, index) => {
        dataYSortMap.push({
          index,
          value: item,
        });
      });
    }
    /* ========>> 数据排序 START <<======== */
    dataYSortMap.sort((a, b) => {
      return -(
        d3.sum(a.value) / a.value.length -
        d3.sum(b.value) / b.value.length
      );
    });
    /* ========>> 数据排序 END <<======== */
    // console.log("====>><<=====");
    // console.log("dataYSortMap: ", dataYSortMap);
    // console.log("dataX: ", dataX);
    // console.log("dataY: ", dataY);
    // console.log("dataZ: ", dataZ);
    // 构建y轴的比例尺
    let ymax = 0;
    dataY.map((item, index) => {
      const tempItem = [ymax, ...item];
      ymax = d3.max(tempItem, function (d) {
        return d;
      }); // 为了增大图表y的上限
    });
    ymax *= 1.2;

    const y = d3
      .scaleLinear()
      .domain([0, ymax])
      .range([attribute.height * chartDrawInfo.axisYHeight, 0]);
    const axisY = d3.axisLeft(y);
    axisY.tickPadding([-axisYTextX]);
    const axisYG = svg
      .append('g')
      .attr('class', 'axisY')
      .attr('transform', `translate(${axisYX},${axisYY})`)
      .call(axisY);
    // 绘制innerY
    axisYG
      .selectAll('g.tick')
      .selectAll('line')
      .attr('x1', attribute.width * chartDrawInfo.rodLeftOffset)
      .attr('x2', axisXWidth)
      .attr('stroke-dasharray', axisYStrokeDasharray);
    // 关闭底部横杆
    axisYG
      .selectAll('g.tick')
      .filter(':nth-child(2)')
      .selectAll('line')
      .attr('x1', attribute.width * chartDrawInfo.rodLeftOffset)
      .attr('x2', 0)
      .attr('stroke-dasharray', 'none');
    axisYG
      .selectAll('g.tick')
      .selectAll('text')
      .attr('color', fontColor)
      .attr('font-size', fontSize);
    // .attr("x", axisYTextX);

    // 构建x轴比例尺
    const x = d3.scalePoint().domain(dataX).range([0, axisXWidth]);
    const axisX = d3.axisBottom(x);
    axisX.tickPadding([axisXTextY]);
    const axisXG = svg
      .append('g')
      .attr('class', 'axisX')
      .attr('transform', `translate(${axisXX},${axisXY})`)
      .call(axisX);
    axisXG
      .selectAll('g.tick')
      .selectAll('text')
      .attr('color', fontColor)
      .attr('font-size', fontSize);
    // .attr("y", axisXTextY);

    /* ========>> 绘制line START <<======== */
    // 构建一个默认为直线的线条绘制器
    let line = '';
    if (attribute.chartRule && attribute.chartRule.isArea) {
      // 面积图
      line = d3
        .area()
        .x(function (d, i) {
          return x(dataX[i]);
        })
        .y1(function (d) {
          return y(d);
        })
        .y0(y(0));
    } else {
      // 普通折线图
      line = d3
        .line()
        .x(function (d, i) {
          return x(dataX[i]);
        })
        .y(function (d) {
          return y(d);
        });
    }
    dataYSortMap.map((tempItem, index) => {
      const item = dataY[tempItem.index];
      let tempBrokenLineFill = brokenLineFill;
      let tempBrokenLineColor = 'rgba(0,0,0,1)';

      tempBrokenLineColor = this.getColorDomain({
        index,
        colorTable: attribute.colorTable,
        areaAlpha: attribute.chartDrawInfo.areaAlpha
          ? attribute.chartDrawInfo.areaAlpha
          : 1,
      });
      if (attribute.chartRule && attribute.chartRule.isArea) {
        tempBrokenLineFill = tempBrokenLineColor;
        tempBrokenLineColor = 'none';
      }

      // 构建g进行偏移处理,构建path绑定数据后,调用绘制器line
      svg
        .append('g')
        .attr('transform', `translate(${axisYX},${axisYY})`)
        .append('path')
        .style('fill', tempBrokenLineFill)
        .style('stroke', tempBrokenLineColor)
        .style('stroke-width', brokenLineWidth)
        .datum(item)
        .attr('d', line);
    });
    /* ========>> 绘制line END <<======== */
    if (dataZ.length > 1) {
      /* ========>> 绘制legend START <<======== */
      const legendG = svg
        .append('g')
        .attr('class', 'legendBox')
        .attr('transform', `translate(${axisXX},${axisXY + 50})`);
      const legend = legendG
        .selectAll('.legend')
        .data(dataYSortMap)
        .enter()
        .append('g')
        .attr('class', 'legend');

      legend
        .append('rect')
        .attr('x', 0)
        .attr('width', WHMin * 0.03)
        .attr('height', WHMin * 0.03)
        .attr('fill', (d, i) => {
          let tempBrokenLineColor = 'rgba(0,0,0,1)';
          tempBrokenLineColor = this.getColorDomain({
            index: i,
            colorTable: attribute.colorTable,
            areaAlpha: attribute.chartDrawInfo.areaAlpha
              ? attribute.chartDrawInfo.areaAlpha
              : 1,
          });
          return tempBrokenLineColor;
        });

      legend
        .append('text')
        .attr('x', WHMin * 0.036)
        .attr('y', WHMin * 0.015)
        .attr('dy', '.35em')
        .style('text-anchor', 'begin')
        .style('font-size', `${fontSize}px`)
        .text((d, i) => {
          return dataZ[i];
        });

      // 获取所有legend元素
      const legends = legend.nodes();

      // legend单元素定位
      let legendWidthSum = 0;
      legendG
        .selectAll('.legend')
        .data(legends)
        .attr('transform', (d, i) => {
          const tempWidth = d.getBBox().width;
          const returnStr = `translate(${legendWidthSum + 20 * i}, 0)`;
          legendWidthSum += tempWidth;
          return returnStr;
        });

      // legend区域居中
      legendG.attr(
        'transform',
        `translate(${
          axisXX + (axisXWidth - legendG.node().getBBox().width) / 2
        },${axisXY + attribute.height * 0.07})`,
      );
      /* ========>> 绘制legend START <<======== */
    }
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    // 绘制图表
    this.drawBrokenLine();

    const { asset } = this.props;
    if (!asset.rt_shotIsComplete) {
      this.props.LoadComplete();
    }
  }

  render() {
    return <div className="drawSVGArea" />;
  }
}

export default BrokenLine;
