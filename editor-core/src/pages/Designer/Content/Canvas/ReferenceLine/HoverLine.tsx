import styles from './index.less';
import { useReference } from './hook/useReferenceLine';

function HoverLine(props: {
  hoverLine: any;
  canvasInfo: any;
  docWidth: number;
  docHeight: number;
}) {
  const { hoverLine, canvasInfo, docWidth, docHeight } = props;
  const { height, width, scale } = canvasInfo || {};
  const { type, pos } = hoverLine || {};
  const { getPad } = useReference();

  // 获取画布实际宽高
  const canvasHeight = height * scale;
  const canvasWidth = width * scale;

  // 画布到外容器的距离;
  const newPad = getPad(type, canvasHeight, canvasWidth);

  return (
    <>
      {pos && (
        <>
          <div
            className={
              type === 'x' ? styles.referenceLineXTip : styles.referenceLineYTip
            }
            style={
              type === 'x'
                ? {
                  top: `${pos}px`,
                }
                : {
                  left: `${pos}px`,
                }
            }
          >
            {type === 'x'
              ? (height - (pos - 26 - newPad) / scale).toFixed(0)
              : ((pos - 26 - newPad) / scale).toFixed(0)}
          </div>
          <div
            className={type === 'x' ? styles.hoverLineX : styles.hoverLineY}
            style={
              type === 'x'
                ? {
                  top: `${pos - 5}px`,
                  left: 26,
                  width: docWidth,
                }
                : {
                  left: `${pos - 5}px`,
                  top: 26,
                  height: docHeight,
                }
            }
          />
        </>
      )}
    </>
  );
}

export default HoverLine;
