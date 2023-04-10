import { mouseMoveDistance } from '@/utils/single';
import SvgEle from './SvgEle';
import styles from './index.less';
import { useSetState } from 'ahooks';
import { Point } from './options';

interface DrawAttr {
  width: number;
  height: number;
  left: number;
  top: number;
}

const SvgCreater = () => {
  const [asset, updateAsset] = useSetState<DrawAttr>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const onDraw = (e: React.MouseEvent) => {
    const { x: boundX, y: boundY } = (e.target as any).getBoundingClientRect();
    const startPoint = [e.clientX - boundX, e.clientY - boundY];

    mouseMoveDistance(e, (x, y) => {
      const obj = {
        width: Math.abs(x),
        height: Math.abs(y),
        left: startPoint[0] + x,
        top: startPoint[1] + y,
      };
      updateAsset(obj);
      console.log('obj', x, y, obj);
    });
  };

  return (
    <div className={styles.SvgCreater} onMouseDown={onDraw}>
      <SvgEle />
    </div>
  );
};

export default SvgCreater;
