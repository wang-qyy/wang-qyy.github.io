import { AssetType } from '@/components/TimeLine/store';
import TemplateState from '@/kernel/store/assetHandler/template';
import styles from './index.less';

const EmptyBg = ({ asset }: { asset: AssetType }) => {
  const { source } = asset;
  const template = source.template as TemplateState;
  const { backgroundColor } = template.pageAttr;

  return (
    <div
      className={styles.emptyBg}
      style={{
        backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${
          backgroundColor.b
        }, ${backgroundColor.a || 1})`,
      }}
    />
  );
};

export default EmptyBg;
