import { RGBAToString } from '@/kernel/utils/single';
import { EffectInfo } from '@/kernel/typing';
import { ForwardedRef, forwardRef, PropsWithChildren } from 'react';
import { defaultEffect } from './options';
import styles from './index.less';

interface IProps {
  effectInfo?: EffectInfo;
  maskUrl?: string;
  resType?: string;
  showEffect: boolean;
  autoPlay?: boolean;
  maskNode?: React.ReactNode;
}

const EffectItem = (
  props: PropsWithChildren<IProps>,
  ref: ForwardedRef<HTMLVideoElement>,
) => {
  const {
    effectInfo = {},
    showEffect,
    autoPlay,
    children,
    maskUrl,
    resType,
    maskNode,
  } = props;

  const {
    sepia,
    brightness,
    contrast,
    blur,
    saturate,
    grayscale,
    invert,
    hue,
    background,
    mixBlendMode = 'normal',
  } = { ...defaultEffect, ...effectInfo };

  const renderMask = () => {
    if (!showEffect) return null;
    if (maskNode) return maskNode;
    if (maskUrl) {
      switch (resType) {
        case 'video':
          return (
            <video
              loop
              ref={ref}
              className={styles.video}
              src={maskUrl}
              crossOrigin="anonymous"
              autoPlay={autoPlay}
            />
          );
        default:
          return (
            <img
              crossOrigin="anonymous"
              alt=""
              className={styles.img}
              src={maskUrl}
            />
          );
      }
    }
    return null;
  };

  return (
    <div className={styles.EffectWrapper}>
      {renderMask()}
      <div
        className={styles.EffectItem}
        style={{
          filter: showEffect
            ? `sepia(${sepia}%)
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturate}%)
            grayscale(${grayscale}%)
            invert(${invert}%)
            hue-rotate(${hue}deg)
            blur(${blur}px)`
            : 'none',
        }}
      >
        {showEffect && background && (
          <div
            className={styles.background}
            style={{ background: RGBAToString(background), mixBlendMode }}
          />
        )}
        {children}
      </div>
    </div>
  );
};

export default forwardRef<HTMLVideoElement, PropsWithChildren<IProps>>(
  EffectItem,
);
