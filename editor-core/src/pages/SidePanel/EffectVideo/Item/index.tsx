import {
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import DragBox from '@/components/DragBox';
import { clickActionWeblog } from '@/utils/webLog';
import { getBackgroundAssetSize } from '@/utils/assetHandler/assetUtils';
import { handleAddAsset } from '@/utils/assetHandler';
import { saveVideoEHistory } from '@/api/videoE';
import styles from './index.modules.less';

interface ItemProps {
  data: any;
  class_id: string | number;
  action: string; // 埋点的action_type
  onClick?: () => void;
  style?: CSSProperties;
}

function Item({ data, class_id, action }: PropsWithChildren<ItemProps>) {
  /**
   * 构建视频特效数据
   * @param asset
   */
  function buildEffectVideoData(data: any) {
    return {
      meta: {
        type: 'videoE',
        isOverlay: true,
        name: data.title || '视频特效',
      },
      attribute: {
        resId: data.gid,
        rt_total_time: data.duration,
        rt_frame_url: data.frame_file,
        rt_total_frame: data.total_frame,
        rt_url: data.url,
        rt_preview_url: data.cover_url,
        isLoop: true,
        ...getBackgroundAssetSize({ width: data.width, height: data.height }),
      },
    };
  }
  const dragAsset = buildEffectVideoData(data);
  function webLog() {
    clickActionWeblog(action, {
      action_label: action === 'videoEffect_add' ? class_id : '',
      asset_id: data.gid,
    });
  }
  // 保存历史记录
  const saveHistory = async () => {
    const res = await saveVideoEHistory(data.gid);
  };
  // 添加、替换视频特效
  const addOrReplace = () => {
    webLog();

    // @ts-ignore
    handleAddAsset(dragAsset);
    saveHistory();
  };
  const [bgInfo, setBgInfo] = useState({});
  const bgInfoFun = data => {
    const tmp = data?.filters || [];
    if (tmp) {
      tmp.forEach(item => {
        if (item.bgimg_url) {
          setBgInfo(item);
        }
      });
    }
  };
  useEffect(() => {
    bgInfoFun(data);
  }, [data]);
  return (
    <DragBox data={dragAsset} type="videoE" onDrop={saveHistory}>
      <div className={styles.wrap} onClick={addOrReplace}>
        <div className={styles.bgImg}>
          {bgInfo?.bgimg_url && <img src={bgInfo?.bgimg_url} alt="" />}
        </div>

        <AutoDestroyVideo
          src={data.url}
          poster={data.cover_url}
          defaultBackground={false}
          style={{ zIndex: 2, overflow: 'hidden' }}
          styleChild={{ backgroundSize: 'cover' }}
          styleVideo={{
            top: '50%',
            width: '100%',
            left: 0,
            objectFit: 'cover',
            transform: 'translate(0, -50%)',
          }}
          loop
        />
        {/* 收藏暂时不做 */}
        {/* {isHover && (
          <div className={styles.collection}>
            <XiuIcon type="iconkuaishoudianzan" />
          </div>
        )} */}
      </div>
    </DragBox>
  );
}

export default Item;
