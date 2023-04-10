import React, { Component } from 'react';

export default class ScaleEnlarge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: 0,
    };
    // console.log(props.asset.meta.id, 'ScaleEnlarge');
  }

  componentDidMount() {
    this.startScaleOut(this.props);
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (nextProps.animatedTime !== this.props.animatedTime) {
      this.startScaleOut(nextProps);
    }
  }

  startScaleOut(nextProps) {
    let ratio = nextProps.animatedTime / nextProps.aniDurationTime;
    if (nextProps.animatedTime === 0) {
      ratio = 0;
    }
    const maxScale = 1.1;
    const allRatio = maxScale + maxScale - 1;

    let currentScale = allRatio * ratio; // 0 - allRatio   here is 0 - 1.2
    if (currentScale > maxScale) {
      currentScale = maxScale - (currentScale - maxScale);
    }
    /*
        0 - 1 - 1.1 - 1
    */
    this.setState(() => {
      return {
        scale: currentScale,
      };
    });
  }

  render() {
    const { scale } = this.state;
    const scaleOutStype = {
      transform: `scale(${scale})`,
    };
    return (
      <div className="movie-animation-scaleOut" style={scaleOutStype}>
        {this.props.children}
      </div>
    );
  }
}
