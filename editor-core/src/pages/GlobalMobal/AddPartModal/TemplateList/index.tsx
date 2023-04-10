import React, {
  useState,
  forwardRef,
  ForwardRefRenderFunction,
  ForwardedRef,
  useRef,
  MutableRefObject,
  useLayoutEffect,
} from 'react';
import { message } from 'antd';
import { delFavTemplate, setFavTemplate, TemplateItem } from '@/api/template';
import { XiuIcon } from '@/components';
import { useGetCanvasInfo } from '@/kernel/store';
import classNames from 'classnames';
import { getCanvasShape } from '@/utils/templateHandler';
import useDisplay from '@/hooks/useDisplay';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
// import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.modules.less';

interface IProps {
  data: TemplateItem[] | undefined;
  isSingle: boolean;
  keyword: string;
  onAdd: (record?: TemplateItem) => void;
  onPreview: (record: TemplateItem) => void;
}

interface ItemType {
  item: TemplateItem;
  isSingle: boolean;
  parent: MutableRefObject<Element>;
  onAdd: (record?: TemplateItem) => void;
  onPreview: (record: TemplateItem) => void;
  itemStyle: { width: number; height: number };
}

const Item: React.FC<ItemType> = props => {
  const { isSingle, item, onAdd, onPreview, itemStyle, parent } = props;
  const [hovered, _hovered] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const previewUrl = isSingle ? item.preview_url : `${item.host}${item.imgUrl}`;

  const smallUrl = isSingle ? item.small_url : `${item.host}${item.small_url}`;

  const switchFav = (isFav: boolean) => {
    if (isFav) {
      setFavTemplate(item.id).then(() => {
        message.success('收藏成功!');
      });
    } else {
      delFavTemplate(item.id).then(() => {
        message.success('取消收藏成功!');
      });
    }
  };

  // useDisplay({
  //   ele: ref as MutableRefObject<Element>,
  //   scrollEle: parent,
  //   onFirstShow: ele => {
  //     console.log('ele', ele);
  //     // clickActionWeblog();
  //   },
  // });

  return (
    <div
      onMouseEnter={() => _hovered(true)}
      onMouseLeave={() => _hovered(false)}
      className={styles.item}
      key={item.id}
      ref={ref}
    >
      <div
        className={classNames(styles.video, {
          [styles.hover]: hovered,
        })}
        style={{
          backgroundImage: `url(${previewUrl})`,
          ...itemStyle,
        }}
      >
        <AutoDestroyVideo
          poster={previewUrl}
          clip={
            isSingle
              ? [item.position, item.position + item.duration]
              : undefined
          }
          playing={hovered}
          src={smallUrl}
        />
        {!isSingle && (
          <div
            className={classNames(styles.favorite, styles.hidden, {
              [styles.favorited]: item.isFav,
            })}
            onClick={() => {
              item.isFav = item.isFav ? 0 : 1;
              switchFav(!!item.isFav);
            }}
          >
            <XiuIcon className={styles.icon} type="iconaixin" />
          </div>
        )}
        {!isSingle && (
          <div className={styles.partCount}>共{item.pages}个片段</div>
        )}
        <div
          className={classNames(styles.preview, styles.hidden)}
          onClick={() => {
            onPreview(item);
          }}
        >
          <XiuIcon className={styles.icon} type="iconyanjing" /> 预览
        </div>
        <div
          className={classNames(styles.add, styles.hidden)}
          onClick={() => {
            onAdd(item);
          }}
        >
          添加该{isSingle ? '片段' : '模板'}
        </div>
      </div>
      <div
        className={classNames(styles.name, {
          [styles.hid]: hovered,
        })}
        title={item.title}
        style={{ maxWidth: itemStyle.width }}
      >
        {item.title}
      </div>
    </div>
  );
};

const Wrapper: ForwardRefRenderFunction<HTMLDivElement, IProps> = (
  props: IProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { data, isSingle, onAdd, onPreview, keyword } = props;
  const { width: canvasW, height: canvasH } = useGetCanvasInfo();
  const shape = getCanvasShape();

  const width = shape === 'h' ? 172 : 216;

  const itemStyle = {
    width,
    height: width * (canvasH / canvasW),
  };

  return (
    <div
      className={styles.TemplateList}
      style={{
        gridTemplateColumns: `repeat(auto-fill, ${width}px)`,
      }}
      ref={ref}
    >
      {!data?.length ? (
        <div className={styles.emptyData}>
          <div className={styles.emptyDataContent}>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <XiuIcon className={styles.emptyDataIcon} type="iconwuneirong1" />
            </div>
            <p>抱歉,暂未找到与“{keyword}”相关内容</p>
            <p>建议换一个关键词搜索试试</p>
          </div>
        </div>
      ) : (
        <>
          {!keyword && (
            <div
              className={styles.item}
              onClick={() => {
                onAdd();
              }}
            >
              <div className={styles.emptyItem} style={itemStyle}>
                <div className={styles.empty}>
                  <div className={styles.addEmpty}>
                    <XiuIcon
                      className={styles.addEmptyIcon}
                      type="iconxingzhuangjiehe6"
                    />
                  </div>
                  <div>添加空白片段</div>
                </div>
              </div>
              <div className={styles.name}>空白片段</div>
            </div>
          )}
          {/** 列表 */}
          {data.map(item => (
            <Item
              key={item.id}
              parent={ref as MutableRefObject<Element>}
              onAdd={onAdd}
              item={item}
              onPreview={onPreview}
              isSingle={isSingle}
              itemStyle={itemStyle}
            />
          ))}
        </>
      )}
    </div>
  );
};

const TemplateList = forwardRef<HTMLDivElement, IProps>(Wrapper);

export default TemplateList;
