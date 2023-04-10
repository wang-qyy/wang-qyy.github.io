import React, { Component } from 'react';

export default class MoveInto extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPos: {
        x: 0,
        y: 0,
      },
    };
    // console.log(props.asset.meta.id, 'MoveInto');
  }

  componentDidMount() {
    this.startMove(this.props);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.animatedTime != this.props.animatedTime) {
      this.startMove(nextProps);
    }
  }

  startMove(nextProps) {
    const {
      animatedTime = 0,
      canvasInfo,
      asset = {},
      aniDurationTime = 500,
      style,
    } = this.props;
    const { scale, width, height } = canvasInfo;
    const posX = nextProps.asset.transform.posX * scale;
    const posY = nextProps.asset.transform.posY * scale;
    const _width = nextProps.asset.attribute.width * scale;
    const _height = nextProps.asset.attribute.height * scale;
    const _canvasWidth = width * scale;
    const _canvasHeight = height * scale;

    let ratio = nextProps.animatedTime / nextProps.aniDurationTime;
    if (nextProps.animatedTime == 0) {
      ratio = 0;
    }
    const assetAttrbute = asset.attribute || {};

    let direction = '1'; // 进入方向（1：上，2：右，3：下，4：左）
    direction = assetAttrbute.animation
      ? assetAttrbute.animation.enter.details.direction
      : 1;
    let _poxX = 0;
    let _poxY = 0;
    const _X = posX + _width;
    const _Y = posY + _height;
    if (direction == '1') {
      _poxY = _Y * ratio - _Y;
    } else if (direction == '3') {
      _poxY = _canvasHeight - posY - (_canvasHeight - posY) * ratio;
    } else if (direction == '2') {
      _poxX = _canvasWidth - posX - (_canvasWidth - posX) * ratio;
    } else {
      _poxX = _X * ratio - _X;
    }
    nextProps.setParentStyle &&
      nextProps.setParentStyle({
        // transform:`translate(${_poxX}px,${_poxY}px)`
        left: _poxX + style.left,
        top: _poxY + style.top,
      });
  }

  render() {
    return (
      <div className="movie-animation-moveInto">{this.props.children}</div>
    );
  }
}
