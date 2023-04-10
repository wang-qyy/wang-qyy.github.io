import React, { Component } from 'react';

export default class MoveOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPos: {
        x: 0,
        y: 0,
      },
      direction: 1,
    };
  }

  componentDidMount() {
    this.startMoveOut(this.props);
  }

  componentWillUpdate(nextProps) {
    const nextAttr = nextProps.asset.attribute;
    if (
      nextProps.animatedTime != this.props.animatedTime ||
      (nextAttr &&
        nextAttr.animation.exit.details.direction != this.state.direction)
    ) {
      this.startMoveOut(nextProps);
      this.setState({
        direction: nextAttr.animation.exit.details.direction,
      });
    }
  }

  startMoveOut(nextProps) {
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

    const ratio = nextProps.animatedTime / nextProps.aniDurationTime;
    const assetAttrbute = asset.attribute || {};

    let direction = '1'; // 移出方向（1：上，2：右，3：下，4：左）
    direction = assetAttrbute.animation
      ? assetAttrbute.animation.exit.details.direction
      : 1;
    let _poxX = 0;
    let _poxY = 0;
    const _X = posX + _width;
    const _Y = posY + _height;
    if (direction == '1') {
      _poxY = -_Y * ratio;
    } else if (direction == '3') {
      _poxY = (_canvasHeight - posY) * ratio;
    } else if (direction == '2') {
      _poxX = (_canvasWidth - posX) * ratio;
    } else {
      _poxX = -_X * ratio;
    }
    nextProps.setParentStyle &&
      nextProps.setParentStyle({
        // transform:`translate(${_poxX}px,${_poxY}px)`
        left: _poxX + style.left,
        top: _poxY + style.top,
      });
  }

  render() {
    return <div className="movie-animation-moveOut">{this.props.children}</div>;
  }
}
