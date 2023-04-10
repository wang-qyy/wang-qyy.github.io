import { useSize } from 'ahooks';
import { BasicTarget } from 'ahooks/lib/utils/dom';
import styles from './index.less';

function HoverLine(props: {
  hoverLine: {
    type: string;
    pos: number;
  };
  canvasInfo: any;
}) {
  const { hoverLine, canvasInfo } = props;
  const { type, pos } = hoverLine || {};

  const size: any = useSize(
    document.querySelector('.xiudodo-canvas') as BasicTarget,
  );

  //  画布到外容器的距离
  const pad =
    type === 'x'
      ? (size?.height - canvasInfo?.height) / 2
      : (size?.width - canvasInfo?.width) / 2;
  const newPad = pad > 0 ? pad : 0;

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
            {((pos - 25 - newPad) / canvasInfo.scale).toFixed(0)}
          </div>
          <div
            className={type === 'x' ? styles.hoverLineX : styles.hoverLineY}
            style={
              type === 'x'
                ? {
                  top: `${pos}px`,
                  left: 25,
                  width: size?.width,
                }
                : {
                  left: `${pos}px`,
                  top: 25,
                  height: size?.height,
                }
            }
          />
        </>
      )}
    </>
  );
}

export default HoverLine;
