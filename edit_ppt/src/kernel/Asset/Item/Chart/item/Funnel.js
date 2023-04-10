import React, { Component } from 'react';
import * as d3 from 'd3';

class Funnel extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 绘制漏斗
   */
  drawFunnel() {
    const { asset, canvas } = this.props;
    const { attribute } = asset;
    const { chartDrawInfo } = attribute;
    const canvasScale = canvas.scale;
    const th = this;

    /* 初始变量定义 START */
    const WHMin =
      attribute.width > attribute.height ? attribute.height : attribute.width; // 最小边计算
    const funnelWidth = attribute.width * attribute.chartDrawInfo.width;
    const funnelHeight = attribute.height * attribute.chartDrawInfo.height;
    const funnelPosX = attribute.width * attribute.chartDrawInfo.posX;
    const funnelPosY = attribute.height * attribute.chartDrawInfo.posY;
    const labelOffset = attribute.width * attribute.chartDrawInfo.labelOffset;
    const fontSize = WHMin * chartDrawInfo.fontSize;
    /* 初始变量定义 END */

    let data = [];
    const dataPos = [];
    data = attribute.userData;
    // 漏斗绘制所需参数
    const maxWidth = funnelWidth;
    const maxHeight = funnelHeight;
    let nowHeight = 0;
    const blockNum = data.length;
    const dataSum = d3.sum(data, (d) => {
      return d[1];
    });

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

    if (attribute.chartRule.funnelType == 1) {
      data.sort((a, b) => {
        return b[1] - a[1];
      });
      data.map((d) => {
        const tempOb = {};
        const dHeight = maxHeight * (d[1] / dataSum);
        const dHeightScaleMin = 1 - nowHeight / maxHeight;
        const dHeightScaleMax = 1 - (nowHeight + dHeight) / maxHeight;
        const dWidthMin = maxWidth * dHeightScaleMin;
        const dWidthMax = maxWidth * dHeightScaleMax;
        const leftTopX = (maxWidth - dWidthMin) / 2;
        const rightTopX = leftTopX + dWidthMin;
        const leftBottomX = (maxWidth - dWidthMax) / 2;
        const rightBottomX = leftBottomX + dWidthMax;
        const minY = nowHeight;
        const maxY = nowHeight + dHeight;
        nowHeight += dHeight;
        Object.assign(tempOb, {
          leftTopX,
          rightTopX,
          leftBottomX,
          rightBottomX,
          minY,
          maxY,
        });
        dataPos.push(tempOb);
      });
    } else if (attribute.chartRule.funnelType == 2) {
      data.sort((a, b) => {
        return a[1] - b[1];
      });
      data.map((d) => {
        const tempOb = {};
        const dHeight = maxHeight * (d[1] / dataSum);
        const dHeightScaleMin = 1 - nowHeight / maxHeight;
        const dHeightScaleMax = 1 - (nowHeight + dHeight) / maxHeight;
        const dWidthMin = maxWidth * (1 - dHeightScaleMin);
        const dWidthMax = maxWidth * (1 - dHeightScaleMax);
        const leftTopX = (maxWidth - dWidthMin) / 2;
        const rightTopX = leftTopX + dWidthMin;
        const leftBottomX = (maxWidth - dWidthMax) / 2;
        const rightBottomX = leftBottomX + dWidthMax;
        const minY = nowHeight;
        const maxY = nowHeight + dHeight;
        nowHeight += dHeight;
        Object.assign(tempOb, {
          leftTopX,
          rightTopX,
          leftBottomX,
          rightBottomX,
          minY,
          maxY,
        });
        dataPos.push(tempOb);
      });
    }

    // 漏斗部件绘制
    const lines = svg
      .append('g')
      .attr('transform', `translate(${funnelPosX}, ${funnelPosY})`)
      .attr('class', 'polyline');
    const polylines = lines
      .selectAll('polyline')
      .data(data)
      .enter()
      .append('polyline')
      .attr('points', function (d, i) {
        const returnData = [
          [dataPos[i].leftBottomX, dataPos[i].maxY],
          [dataPos[i].leftTopX, dataPos[i].minY],
          [dataPos[i].rightTopX, dataPos[i].minY],
          [dataPos[i].rightBottomX, dataPos[i].maxY],
        ];
        if (i == data.length - 1) {
          returnData.push([dataPos[i].leftBottomX, dataPos[i].maxY]);
        }
        return returnData;
      })
      .attr('fill', (d, i) => {
        return th.getColorDomain({
          index: i,
          colorTable: attribute.colorTable,
        });
      })
      .attr('stroke', '#333')
      .attr('stroke-width', `${WHMin * 0.003}px`)
      .attr('stroke-dasharray', '0');
    //   .style('opacity', 0.5)
    // 绘制文本提示
    const labels = svg
      .append('g')
      .attr('transform', `translate(${funnelPosX}, ${funnelPosY})`)
      .attr('class', 'texts');
    const texts = labels
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text((d) => {
        return `${d[0]}：${d[1]}`;
      })
      .attr('y', function (d, i) {
        return (dataPos[i].maxY - dataPos[i].minY) / 2 + dataPos[i].minY;
      })
      .attr('x', function (d, i) {
        return (
          (dataPos[i].leftTopX - dataPos[i].leftBottomX) / 2 +
          dataPos[i].leftBottomX -
          labelOffset
        );
      })
      .attr('font-size', fontSize)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central');
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
    this.drawFunnel();

    const { asset } = this.props;
    if (!asset.rt_shotIsComplete) {
      this.props.LoadComplete();
    }
  }

  render() {
    return <div className="drawSVGArea" />;
  }
}

export default Funnel;
