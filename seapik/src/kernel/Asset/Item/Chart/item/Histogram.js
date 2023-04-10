import React, { Component } from 'react';
import * as d3 from 'd3';

class Histogram extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 绘制柱形图
   * @param {*} type
   */
  drawHistogram(type = 0) {
    const { asset, canvas } = this.props;
    const { attribute } = asset;
    const { chartDrawInfo } = attribute;
    const { chartRule } = attribute;
    const canvasScale = canvas.scale;
    const th = this;

    /* 初始变量定义 START */
    const WHMin =
      attribute.width > attribute.height ? attribute.height : attribute.width; // 最小边计算
    const { isLeftBar } = chartRule;

    const fontSize = WHMin * chartDrawInfo.fontSize; // 文字大小
    const fontColor = `rgba(${chartDrawInfo.fontColor.r},${chartDrawInfo.fontColor.g},${chartDrawInfo.fontColor.b},${chartDrawInfo.fontColor.a})`; // 文字颜色
    const axisXTextY = WHMin * chartDrawInfo.axisXTextY;
    const axisYTextX = WHMin * chartDrawInfo.axisYTextX;
    const axisYX = attribute.width * chartDrawInfo.axisPosX; // Y坐标轴X坐标
    const axisYY = attribute.height * chartDrawInfo.axisPosY; // Y坐标轴Y坐标
    const axisXX = attribute.width * chartDrawInfo.axisPosX;
    const axisXY =
      attribute.height * (chartDrawInfo.axisPosY + chartDrawInfo.axisYHeight);
    const brokenLineWidth = WHMin * chartDrawInfo.brokenLineWidth;
    const axisXWidth = attribute.width * chartDrawInfo.axisXWidth;
    const axisYHeight = attribute.height * chartDrawInfo.axisYHeight;
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
    /* 初始变量定义 END */

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
    let dataX = [];
    let dataY = [];
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
      if (dataZ.length == 0) {
        dataZ = ['单数据'];
      }
    }

    if (isLeftBar) {
      const tempData = dataY;
      dataY = dataX;
      dataX = tempData;
      // 构建y轴的比例尺
      const ydomain = dataY.map(function (d, i) {
        return `${d}_${i}`;
      });
      const y = d3.scaleBand().domain(ydomain).range([0, axisYHeight]);
      const axisY = d3.axisLeft(y);
      axisY.tickPadding([-axisYTextX]);
      const axisYG = svg
        .append('g')
        .attr('class', 'axisY')
        .attr('transform', `translate(${axisYX},${axisYY})`)
        .call(axisY);
      // Y轴样式修改
      axisYG
        .selectAll('g.tick')
        .selectAll('text')
        .attr('color', fontColor)
        .attr('font-size', fontSize)
        .text((d, i) => {
          return d.split('_')[0];
        });

      // 构建x轴比例尺
      let xmax = 0;
      dataX.map((item, index) => {
        const tempItem = [xmax, ...item];
        xmax = d3.max(tempItem, function (d) {
          return d;
        }); // 为了增大图表y的上限
      });
      xmax *= 1.2;
      const x = d3.scaleLinear().domain([0, xmax]).range([0, axisXWidth]);

      const axisX = d3.axisBottom(x);
      axisX.tickPadding([axisXTextY]);
      const axisXG = svg
        .append('g')
        .attr('class', 'axisX')
        .attr('transform', `translate(${axisXX},${axisXY})`)
        .call(axisX);
      axisXG
        .selectAll('g.tick')
        .attr('class', 'axisXRod')
        .selectAll('line')
        .attr('y1', -axisYHeight)
        .attr('y2', -attribute.height * chartDrawInfo.rodBottomOffset)
        .attr('stroke-dasharray', axisYStrokeDasharray);
      // X轴样式修改
      axisXG
        .selectAll('g.tick')
        .selectAll('text')
        .attr('color', fontColor)
        .attr('font-size', fontSize);
      /* ========>> 绘制bar START <<======== */
      const xBandwidth = y.bandwidth() * 0.9;
      const xBandGap = y.bandwidth() * 0.05;
      const barGap = 0.0034 * asset.attribute.width;
      const barWidth = (xBandwidth + barGap) / dataZ.length;
      for (let j = 0; j < dataZ.length; j++) {
        const bar = svg
          .append('g')
          .attr('transform', `translate(${axisYX},${axisYY})`);
        bar
          .selectAll('rect')
          .data(dataY)
          .enter()
          .append('rect')
          .attr('y', function (d, i) {
            return y(`${d}_${i}`) + barWidth * j + xBandGap;
          })
          .attr('x', function (d, i) {
            return 0;
          })
          .attr('height', barWidth - barGap)
          .attr('width', function (d, i) {
            return x(dataX[j][i]);
          })
          .attr('fill', (d, i) => {
            let index = j;
            if (dataZ.length == 1) {
              index = i;
            }
            let tempBrokenLineColor = 'rgba(0,0,0,1)';
            tempBrokenLineColor = this.getColorDomain({
              index,
              colorTable: attribute.colorTable,
              areaAlpha: attribute.chartDrawInfo.areaAlpha
                ? attribute.chartDrawInfo.areaAlpha
                : 1,
            });
            return tempBrokenLineColor;
          });
      }
      /* ========>> 绘制bar END <<======== */
    } else {
      // 构建y轴的比例尺
      let ymax = 0;
      dataY.map((item, index) => {
        const tempItem = [ymax, ...item];
        ymax = d3.max(tempItem, function (d) {
          return d;
        }); // 为了增大图表y的上限
      });
      ymax *= 1.2;
      const y = d3.scaleLinear().domain([0, ymax]).range([axisYHeight, 0]);
      const axisY = d3.axisLeft(y);
      axisY.tickPadding([-axisYTextX]);
      const axisYG = svg
        .append('g')
        .attr('class', 'axisY')
        .attr('transform', `translate(${axisYX},${axisYY})`)
        .call(axisY);
      // Y轴样式修改
      axisYG
        .selectAll('g.tick')
        .selectAll('text')
        .attr('color', fontColor)
        .attr('font-size', fontSize);
      axisYG
        .selectAll('g.tick')
        .selectAll('line')
        .attr('x1', attribute.width * chartDrawInfo.rodLeftOffset)
        .attr('x2', axisXWidth)
        .attr('stroke-dasharray', axisYStrokeDasharray);
      // .attr("stroke", () => {return "#ccc"});
      // 关闭底部横杆
      axisYG
        .selectAll('g.tick')
        .filter(':nth-child(2)')
        .selectAll('line')
        .attr('x1', attribute.width * chartDrawInfo.rodLeftOffset)
        .attr('x2', 0)
        .attr('stroke-dasharray', 'none');
      // 构建x轴比例尺
      const ydomain = dataX.map(function (d, i) {
        return `${d}_${i}`;
      }); // 添加下标来使每项数据唯一
      // ['制造','外包','金融','咨询']
      const x = d3.scaleBand().domain(ydomain).range([0, axisXWidth]);

      const axisX = d3.axisBottom(x);
      axisX.tickPadding([axisXTextY]);
      const axisXG = svg
        .append('g')
        .attr('class', 'axisX')
        .attr('transform', `translate(${axisXX},${axisXY})`)
        .call(axisX);
      // X轴样式修改
      axisXG
        .selectAll('g.tick')
        .selectAll('text')
        .attr('color', fontColor)
        .attr('font-size', fontSize)
        .text((d, i) => {
          return d.split('_')[0]; // 渲染x轴显示时 去除唯一性下标
        });
      /* ========>> 绘制bar START <<======== */
      const left = x.step();
      const xBandwidth = x.bandwidth() * 0.9;
      const xBandGap = x.bandwidth() * 0.05;
      const barGap = 0.0034 * asset.attribute.width;
      const barWidth = (xBandwidth + barGap) / dataZ.length;
      for (let j = 0; j < dataZ.length; j++) {
        const bar = svg
          .append('g')
          .attr('transform', `translate(${axisYX},${axisYY})`);
        bar
          .selectAll('rect')
          .data(dataX)
          .enter()
          .append('rect')
          .attr('x', function (d, i) {
            return x(`${d}_${i}`) + barWidth * j + xBandGap;
          }) // x() = > 获取每项数据追加下标
          .attr('y', function (d, i) {
            return y(dataY[j][i]);
          })
          .attr('width', barWidth - barGap)
          .attr('height', function (d, i) {
            return axisYHeight - y(dataY[j][i]);
          })
          // .attr("fill", (d) => {return "#66ccff"})
          .attr('fill', (d, i) => {
            let index = j;
            if (dataZ.length == 1) {
              index = i;
            }
            let tempBrokenLineColor = 'rgba(0,0,0,1)';
            tempBrokenLineColor = this.getColorDomain({
              index,
              colorTable: attribute.colorTable,
              areaAlpha: attribute.chartDrawInfo.areaAlpha
                ? attribute.chartDrawInfo.areaAlpha
                : 1,
            });
            return tempBrokenLineColor;
          });
      }
      /* ========>> 绘制bar END <<======== */
    }
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

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    // 绘制图表
    this.drawHistogram();

    const { asset } = this.props;
    if (!asset.rt_shotIsComplete) {
      this.props.LoadComplete();
    }
  }

  render() {
    return <div className="drawSVGArea" />;
  }
}

export default Histogram;
