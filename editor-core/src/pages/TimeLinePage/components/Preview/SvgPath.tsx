import XiuIcon from '@/components/XiuIcon';
import { ShapeType } from '@/kernel';
import { shapeList } from '@/pages/SidePanel/CloudElement/FreeformDraw/options';

import styles from './index.less';

const SvgPath = ({ shapeType }: { shapeType: ShapeType }) => {
  const shape = shapeList.find(t => t.type === shapeType);

  return (
    <div className={styles.svgPath}>
      <XiuIcon type={shape?.icon || 'zhixian'} style={{ marginRight: 6 }} />
      {shape?.name || '路径'}
    </div>
  );
};

export default SvgPath;
