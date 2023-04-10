import { Empty, Divider } from 'antd';
import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { ExclamationCircleFilled } from '@ant-design/icons';

import {
  activeEditableAssetInTemplate,
  useCurrentTemplate,
  useTemplateLoadByObserver,
  setCurrentTime,
  getCurrentTimeRange,
  AssetClass,
  observer,
  toJS,
} from '@hc/editor-core';
import OverwritePopover from '@/components/OverwritePopover';
import XiuIcon from '@/components/XiuIcon';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.modules.less';

interface ReplaceEle {
  count: number;
  desc: string;
  list: Array<AssetClass>;
}

interface AssetsItem {
  assId: string;
  type: string;
  resId: string;
  use_level: number;
}

interface ReplaceDescProps {
  data: {
    images: ReplaceEle;
    texts: ReplaceEle;
  };
  onClose: () => void;
  total: number;
}

const ReplaceDesc = ({ data, onClose, total }: ReplaceDescProps) => {
  return (
    <div className={styles['detail-wrap']}>
      <div className={styles.title}>
        为了让你获得最佳用户体验，我们已为初步整理可能需要替换的元素。
      </div>

      {total ? (
        Object.keys(data).map(item => {
          const info = data[item];

          if (!info?.count) return '';
          return (
            <div key={`replace-${item}`}>
              <Divider />
              <div className={styles['list-wrap']}>
                <div className={styles['type-desc']}>
                  <span>{info.count}</span> 处{info.desc}
                </div>
                <div className={classNames(styles[`${item}-wrap`])}>
                  {info.list.map((ele: AssetClass, index: number) => (
                    <div
                      key={`replace-${item}-${index}`}
                      className={classNames(
                        styles.item,
                        styles[`${item}-item`],
                      )}
                      onClick={() => {
                        activeEditableAssetInTemplate(ele.meta.id);
                        setCurrentTime(
                          ele.assetDuration.startTime + getCurrentTimeRange(),
                          false,
                        );
                        onClose();
                      }}
                    >
                      <div className={styles.mask}>
                        <span>
                          <XiuIcon type="icondingwei" />
                          画布定位
                        </span>
                      </div>

                      {item === 'texts' && (
                        <span>{ele?.attribute.text?.join(' ')}</span>
                      )}
                      {item === 'images' && (
                        <img
                          src={ele?.attribute?.picUrl}
                          alt="replace"
                          width="100%"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <Empty className={styles.empty} description="未检测到需要替换元素" />
      )}
    </div>
  );
};

const ReplaceWarn = ({ className }: { className: string }) => {
  const { templateInfo } = useTemplateInfo();

  const { template } = useCurrentTemplate();
  const allAsset = template?.assets || [];

  const { loadComplete } = useTemplateLoadByObserver();

  const [popoverVisible, setPopoverVisible] = useState(false);

  const { assets, replaceEles } = useMemo(() => {
    const assetsList: Array<number> = [];
    const replaceEle: Array<AssetsItem> = [];

    if (loadComplete) {
      templateInfo?.assets?.forEach(item => {
        if (!item.use_level) return;
        replaceEle.push(item);

        allAsset.forEach(ele => {
          if (ele.attribute.resId === item.resId) {
            assetsList.push(ele);
          }
        });
      });
    }
    return { assets: assetsList, replaceEles: replaceEle };
  }, [loadComplete, allAsset]);

  const getNeedReplaceEle = () => {
    let images: Array<AssetClass> = [];
    let texts: Array<AssetClass> = [];

    replaceEles.forEach(item => {
      const temp = assets.filter(
        (ele: AssetClass) => ele.attribute.resId === item.resId,
      );
      if (!temp.length) return;

      if (item.type === 'text') {
        texts = [...new Set(texts.concat(temp))];
      } else if (['image', 'pic'].includes(item.type)) {
        images = [...new Set(images.concat(temp))];
      }
    });

    const imageCount = images.length;
    const textCount = texts.length;

    return {
      totalReplace: imageCount + textCount,
      ele: {
        texts: {
          count: textCount,
          desc: '文字替换',
          list: texts,
        },
        images: {
          count: imageCount,
          desc: '图片替换',
          list: images,
        },
      },
    };
  };
  const { total, eles } = useMemo(() => {
    const { totalReplace, ele } = getNeedReplaceEle();
    return {
      total: totalReplace,
      eles: ele,
    };
  }, [assets]);

  return (
    <OverwritePopover
      visible={popoverVisible}
      onVisibleChange={visible => {
        setPopoverVisible(visible);
        if (visible) {
          clickActionWeblog('header_replace_warn');
        }
      }}
      content={
        <ReplaceDesc
          data={eles}
          total={total}
          onClose={() => setPopoverVisible(false)}
        />
      }
    >
      <div className={classNames(styles.wrap, className)}>
        <span className={classNames({ [styles.num]: total })}>
          {total > 0 && <ExclamationCircleFilled />}
          {total}
        </span>
        个替换提醒
      </div>
    </OverwritePopover>
  );
};

export default observer(ReplaceWarn);
