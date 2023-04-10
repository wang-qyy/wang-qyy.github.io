import React, { Component } from 'react';

export default class ScaleReduce extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: 1,
      opacity: 1,
    };
  }

  componentDidMount() {
    this.startScaleIn(this.props);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.animatedTime != this.props.animatedTime) {
      this.startScaleIn(nextProps);
    }
  }

  startScaleIn(nextProps) {
    const ratio = nextProps.animatedTime / nextProps.aniDurationTime;

    const minScale = 0.25;
    let _scale = 1 - ratio;
    let _opacity = 1;
    if (_scale < minScale) {
      _scale = minScale;
      _opacity = (1 - ratio) / minScale;
    }
    /*
           scale 1 - 0.25 -> opacity -> 1 - 0
        */
    this.setState(() => {
      return {
        scale: _scale,
        opacity: _opacity,
      };
    });
  }

  render() {
    const { scale, opacity } = this.state;
    const scaleInStype = {
      transform: `scale(${scale})`,
      opacity,
    };
    return (
      <div className="movie-animation-scaleIn" style={scaleInStype}>
        {this.props.children}
      </div>
    );
  }
}
