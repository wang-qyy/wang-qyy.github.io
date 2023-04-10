import React, { Component } from 'react';

export default class RubOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runInDirection: 1, // “擦入”方向（1：上，2：右，3：下，4：左）,
      refDom: null,
      rubOutStyle: {},
    };
  }

  componentDidMount() {
    this.startRubOut(this.props);
  }

  componentWillUpdate(nextProps) {
    const nextAttr = nextProps.asset.attribute;
    if (
      nextProps.animatedTime != this.props.animatedTime ||
      (nextAttr &&
        nextAttr.animation.exit.details.direction != this.state.runInDirection)
    ) {
      this.startRubOut(nextProps);
      this.setState({
        runInDirection: nextAttr.animation.exit.details.direction,
      });
    }
  }

  startRubOut(nextProps) {
    const { refDom } = this.state;
    const { asset } = nextProps;
    const container = this.runInContainerRef || refDom;
    const domWidth = container.offsetWidth;
    const domHeight = container.offsetHeight;

    const ratio = nextProps.animatedTime / nextProps.aniDurationTime;
    const runInDirection = asset.attribute.animation.exit.details.direction;
    /*
            0 - 1 - 1.1 - 1
        */
    let _x = 0;
    let _y = 0;
    let _gradient = '';
    let _size = '';
    let shandowRatio = 0.1; // shandowRatio - 预留的擦出阴影空间
    if (runInDirection == 2) {
      // 右擦出
      const maskW = domWidth * (2 + shandowRatio);
      _x = (-maskW / 2) * ratio;
      _size = `${maskW}px ${domHeight}px`;
      shandowRatio = (domWidth * shandowRatio) / maskW;
      _gradient = `linear,
            0% 100%, 100% 100%,
            from(rgb(0, 0, 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0, 0)),
            to(rgba(0, 0, 0, 0))`;
    } else if (runInDirection == 4) {
      // 左擦出
      const maskW = domWidth * (2 + shandowRatio);
      _x = (maskW / 2) * ratio - maskW / 2;
      _size = `${maskW}px ${domHeight}px`;
      shandowRatio = (domWidth * shandowRatio) / maskW;
      _gradient = `linear,
            0% 100%, 100% 100%,
            from(rgb(0, 0, 0 , 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0)),
            to(rgba(0, 0, 0))`;
    } else if (runInDirection == 1) {
      // 上擦出
      const maskH = domHeight * (2 + shandowRatio);
      _y = (-maskH / 2) * ratio;
      _size = `${domWidth}px ${maskH}px`;
      shandowRatio = (domHeight * shandowRatio) / maskH;
      _gradient = `linear,
            left top, left bottom,
            from(rgb(0, 0, 0 )),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0 ,0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0 ,0)),
            to(rgba(0, 0, 0 , 0))`;
    } else {
      // 下擦出
      const maskH = domHeight * (2 + shandowRatio);
      _y = (maskH / 2) * ratio - maskH / 2;
      _size = `${domWidth}px ${maskH}px`;
      shandowRatio = (domHeight * shandowRatio) / maskH;
      _gradient = `linear,
            left top, left bottom,
            from(rgb(0, 0, 0 , 0)),
            color-stop(${0.5 - shandowRatio / 2}, rgb(0, 0, 0, 0)),
            color-stop(${0.5}, rgba(0, 0, 0)),
            color-stop(${0.5 + shandowRatio / 2}, rgba(0, 0, 0)),
            to(rgba(0, 0, 0))`;
    }

    const rubOutStyle = {
      WebkitMaskPosition: `${_x}px ${_y}px`,
      WebkitMaskSize: `${_size}`,
      WebkitMaskImage: `-webkit-gradient(${_gradient})`,
    };
    this.setState(() => {
      return {
        refDom: container || refDom,
        rubOutStyle,
      };
    });
  }

  render() {
    const { rubOutStyle } = this.state;
    return (
      <div
        className="movie-animation-runOut"
        ref={(ref) => (this.runInContainerRef = ref)}
        style={rubOutStyle}
      >
        {this.props.children}
      </div>
    );
  }
}
