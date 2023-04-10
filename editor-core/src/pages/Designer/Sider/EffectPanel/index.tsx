import EffectItem from '@/components/EffectItem';
import { Attribute } from '@/kernel';
import MaterialItem from '@/pages/Designer/Sider/components/MaterialItem';

import styles from './index.less';
import { Item, mockData, previewImage, previewVideo } from './options';

const EffectPanel = () => {
  return (
    <div className={styles.EffectPanel}>
      <div className={styles.list}>
        {mockData.map(item => {
          return (
            <div key={item.id}>
              <MaterialItem
                style={{ width: 100, height: 56, minHeight: 56 }}
                type="effect"
                meta={{ overlayType: item.overlayType }}
                attribute={{
                  effectInfo: item.effectInfo,
                  picUrl: item.picUrl,
                  rt_url: item.rt_url,
                }}
                previewNode={
                  <div style={{ width: 380, height: 214 }}>
                    <EffectItem
                      effectInfo={item.effectInfo}
                      showEffect
                      autoPlay
                      maskUrl={item.picUrl || item.rt_url}
                      resType={item.overlayType}
                    >
                      <video
                        style={{ width: '100%' }}
                        src={previewVideo}
                        muted
                        autoPlay
                      />
                    </EffectItem>
                  </div>
                }
              >
                <EffectItem
                  effectInfo={item.effectInfo}
                  maskUrl={item.picUrl || item.rt_url}
                  resType={item.overlayType}
                  showEffect
                >
                  <img src={previewImage} alt="img" />
                </EffectItem>
              </MaterialItem>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EffectPanel;
