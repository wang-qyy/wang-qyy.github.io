import React from 'react';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import { XiuIcon } from '@/components';
import classnames from 'classnames';
import './index.less';

export interface HandleProps {
  prefixCls?: string;
  className?: string;
  vertical?: boolean;
  reverse?: boolean;
  offset?: number;
  style?: React.CSSProperties;
  disabled?: boolean;
  min?: number;
  max?: number;
  index: number;
  value?: number;
  tabIndex?: number;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaValueTextFormatter?: (val: number) => string;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  type?: string;
}

export default class ArrowNodeHandle extends React.Component<HandleProps> {
  state = {
    clickFocused: false,
  };

  onMouseUpListener: { remove: () => void };

  handle: HTMLElement;

  componentDidMount() {
    // mouseup won't trigger if mouse moved out of handle,
    // so we listen on document here.
    this.onMouseUpListener = addEventListener(
      document,
      'mouseup',
      this.handleMouseUp,
    );
  }

  componentWillUnmount() {
    if (this.onMouseUpListener) {
      this.onMouseUpListener.remove();
    }
  }

  setHandleRef = node => {
    this.handle = node;
  };

  setClickFocus(focused) {
    this.setState({ clickFocused: focused });
  }

  handleMouseUp = () => {
    if (document.activeElement === this.handle) {
      this.setClickFocus(true);
    }
  };

  handleMouseDown = e => {
    // avoid selecting text during drag
    // https://github.com/ant-design/ant-design/issues/25010
    e.preventDefault();
    // fix https://github.com/ant-design/ant-design/issues/15324
    this.focus();
  };

  handleBlur = () => {
    this.setClickFocus(false);
  };

  handleKeyDown = () => {
    this.setClickFocus(false);
  };

  clickFocus() {
    this.setClickFocus(true);
    this.focus();
  }

  focus() {
    this.handle.focus();
  }

  blur() {
    this.handle.blur();
  }

  render() {
    const {
      prefixCls,
      vertical,
      reverse,
      offset,
      style,
      disabled,
      min,
      max,
      value,
      index,
      tabIndex,
      ariaLabel,
      ariaLabelledBy,
      ariaValueTextFormatter,
      type,
      ...restProps
    } = this.props;

    const positionStyle = vertical
      ? {
          [reverse ? 'top' : 'bottom']: `${offset}%`,
          [reverse ? 'bottom' : 'top']: 'auto',
        }
      : {
          [reverse ? 'right' : 'left']: `${offset}%`,
          [reverse ? 'left' : 'right']: 'auto',
        };
    const elStyle = {
      ...style,
      ...positionStyle,
    };

    let mergedTabIndex = tabIndex || 0;
    if (disabled || tabIndex === null) {
      mergedTabIndex = null;
    }

    let ariaValueText;
    if (ariaValueTextFormatter) {
      ariaValueText = ariaValueTextFormatter(value);
    }

    return (
      <XiuIcon
        ref={this.setHandleRef}
        tabIndex={mergedTabIndex}
        {...restProps}
        style={elStyle}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        onMouseDown={this.handleMouseDown}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={!!disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuetext={ariaValueText}
        className={classnames({
          'xiu-animationRange-handle': true,
          'xiu-animationRange-handle-turn': index === 0,
        })}
        type={type ?? 'iconzuoyou'}
      />
    );
  }
}
