import classNames from 'classnames';
import Lottie from '@/components/Lottie';
import { handleAddAsset } from '@/utils/assetHandler';
import styles from '../index.less';

const LottieItem = (Props: any) => {
  const { i, index } = Props;

  const bindClickAdd = (params: any) => {
    // 添加动画
    const replaceParams = {
      width: 300,
      height: 300,
      resId: params.id,
      rt_preview_url: params.preview,
      preview_url: params.preview,
      rt_url: params.sample,
      ...params,
    };
    handleAddAsset({ meta: { type: 'lottie' }, attribute: replaceParams });
  };
  return (
    <div
      className={classNames({
        [styles.rolePopoverWarpItem]: true,
        [styles.rolePopoverWarpItem4]: (index + 1) % 4 === 0,
      })}
    >
      <div
        className={styles.rolePopoverWarpItemImg}
        onClick={() => bindClickAdd(i)}
      >
        <Lottie path={i.sample} preview={i.preview} />
      </div>
      <div className={styles.rolePopoverWarpItemName}>{i.title}</div>
    </div>
  );
};

export default LottieItem;
