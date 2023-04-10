import { handleReplaceAsset } from '@/utils/assetHandler';
import { clickActionWeblog } from '@/utils/webLog';
import { getReplaceAssets } from '../handler';

import styles from './index.modules.less';

export default function MultiReplace({
  selected,
  onSuccess,
}: {
  selected: any[];
  onSuccess: () => void;
}) {
  const { images } = getReplaceAssets();
  function multiReplace() {
    clickActionWeblog('bottom_0011');

    selected.forEach((item, index) => {
      const asset = images[index];
      const { type, ...resplaceAttr } = item;
      if (asset) {
        handleReplaceAsset({
          params: { meta: { type }, attribute: resplaceAttr },
          asset,
        });
      }
    });

    onSuccess();
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 38,
        paddingLeft: 6,
      }}
    >
      <div style={{ fontSize: 12 }}>
        已选<span className={styles.num}>{selected.length}</span>张图片/视频
        还差
        <span className={styles.num}>{images.length - selected.length}</span>张
      </div>

      <div className={styles['file-action-replace']} onClick={multiReplace}>
        点击替换
      </div>
    </div>
  );
}
