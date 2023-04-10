import {
  memo,
  MouseEvent,
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { Button, Checkbox } from 'antd';
import { useDrag } from 'react-dnd';
import classnames from 'classnames';
import { getEmptyImage } from 'react-dnd-html5-backend';

import XiuIcon from '@/components/XiuIcon';
import { formatNumberToTime, stopPropagation } from '@/utils/single';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { clickActionWeblog } from '@/utils/webLog';
import {
  getTemplateIndexById,
  useCurrentTemplate,
  getValidAssets,
  getAllTemplates,
} from '@hc/editor-core';

import { TEMPLATE_DRAG } from '@/constants/drag';

import useAddTemplate from '@/hooks/useAddTemplate';
import useEditorConfig from '@/hooks/useEditorConfig';
import NoTitleModal from '@/components/NoTitleModal';
import type { TemplateListItem } from '../typing';
import { useCollect } from '../hooks';
import './index.less';

export interface TemplateItemProps {
  data: TemplateListItem;
  beforeReplace: (data: TemplateListItem) => void;
  className?: string;
  width?: number | undefined;
  type: 'template' | 'collection' | 'draft';
  setUpdateTime?: (date: any) => void;
}

const TemplateItem = ({
  data,
  beforeReplace,
  className = '',
  width = 150,
  type,
  setUpdateTime,
  ...res
}: PropsWithChildren<TemplateItemProps>) => {
  const { beMyFav } = useCollect();
  const [isFav, setIsFav] = useState(type === 'collection' || data.isFav);
  const { template } = useCurrentTemplate();
  const moduleForAdd = useEditorConfig('moduleForAdd');
  const currentTempIndex = useMemo(() => {
    if (template?.id) return getTemplateIndexById(template.id);
  }, [template?.id]);
  const [replaceModule, setReplaceModule] = useState(false);
  const cbFun = useRef<() => void>();
  const loadedFlag = useRef(false);

  const poster = data.imgUrl ? `${data.host}${data.imgUrl}` : '';
  const previewVideo = data.small_url ? `${data.host}${data.small_url}` : '';

  // 获取单个模板详情
  const {
    handleReplaceAllTemplate,
    getTemplate,
    loaded,
    insertAllTemplates,
    parts,
    isDifferCurrentSize,
    switchDraft,
  } = useAddTemplate(data);

  function beforeInsertTemplates(dropContainer: 'bottom' | 'canvas') {
    if (getValidAssets().length === 0 && getAllTemplates().length === 1) {
      // 只有一个空白片段

      clickActionWeblog(
        dropContainer === 'bottom' ? 'drag_add_002 ' : 'drag_add_001',
        {
          action_label: type,
        },
      );
      handleReplaceAllTemplate();
    } else if (moduleForAdd.getConfig()) {
      insertAllTemplates(currentTempIndex);
    } else {
      setReplaceModule(true);
    }
  }

  const [collected, drag, dragPreview] = useDrag(() => ({
    type: TEMPLATE_DRAG,
    item: {
      attribute: {
        width: data.width,
        height: data.height,
        rt_preview_url: poster,
      },
      offset: {
        offsetLeft: 0,
        offsetTop: 0,
        offsetLeftPercent: 0,
        offsetTopPercent: 0,
      },

      add: () => {
        if (loaded) {
          insertAllTemplates();
        } else {
          cbFun.current = () => {
            insertAllTemplates();
          };
        }
      },
      replace: (dropContainer: 'bottom' | 'canvas') => {
        if (loaded) {
          beforeInsertTemplates(dropContainer);
        } else {
          cbFun.current = beforeInsertTemplates;
        }
      },
    },
    end: () => {
      if (cbFun.current && loadedFlag.current) {
        cbFun.current();
        cbFun.current = undefined;
      }
    },
    collect: monitor => {
      return {
        isDragging: !!monitor.isDragging(),
      };
    },
  }));
  useEffect(() => {
    loadedFlag.current = loaded;
    if (cbFun.current && loaded) {
      cbFun.current();
      cbFun.current = undefined;
    }
  }, [loaded]);
  useEffect(() => {
    if (collected.isDragging) {
      if (type === 'draft') {
        getTemplate({ upicId: data.id });
      } else {
        getTemplate({ picId: data.id });
      }
    }
  }, [collected.isDragging]);
  useEffect(() => {
    // 隐藏默认的拖拽样式
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <>
      <div
        ref={drag}
        className={`template-item-wrap ${className}`}
        style={{
          width,
          height: width * (Number(data.height) / Number(data.width)),
        }}
        onClick={() => beforeReplace(data)}
        {...res}
      >
        <div className="video-container">
          {type !== 'draft' && (
            <>
              <div className="module-time">
                {formatNumberToTime(
                  parseInt(`${Number(data.duration) / 1000}`, 10),
                )}
              </div>
              <div className="module-count">{`共${data.pages}个片段`}</div>
            </>
          )}
          {!collected.isDragging && (
            <AutoDestroyVideo poster={poster} src={previewVideo} />
          )}

          {type !== 'draft' && (
            <XiuIcon
              className={classnames('module-myFav', {
                active: isFav,
              })}
              type="iconaixin"
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                stopPropagation(e);
                clickActionWeblog('action_template_collection', {
                  action_label: data.id,
                });
                if (type === 'collection' && setUpdateTime) {
                  setUpdateTime(new Date());
                }
                beMyFav(e, data.id, isFav);
                setIsFav(!isFav);
              }}
            />
          )}

          {type === 'draft' && (
            <div className="videoBottom">
              <div className="videoBottomWarp">
                <img
                  className="videoBottomImg"
                  src={data?.userInfo?.avatar}
                  alt=""
                />
                <div className="videoBottomName">{data?.title}</div>
                {width === 314 && (
                  <div className="videoBottomTime">{data?.updated}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <NoTitleModal
        visible={replaceModule}
        footer={null}
        width={360}
        centered
        onCancel={() => {
          setReplaceModule(false);
          moduleForAdd.setState(false);
        }}
      >
        <div className="replace-template-module">
          <h3>当前模板包含{parts.length}个片段</h3>
          <h3>是否全部替换当前所有片段?</h3>
          <div className="replace-button-box">
            <Button
              hidden={isDifferCurrentSize}
              onClick={() => {
                moduleForAdd.setConfig();
                insertAllTemplates(currentTempIndex);
                setReplaceModule(false);
              }}
            >
              添加全部片段
            </Button>
            {type === 'draft' ? (
              <Button
                type="primary"
                style={{ width: 126 }}
                onClick={() => {
                  switchDraft();
                  setReplaceModule(false);
                }}
              >
                切换草稿
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  moduleForAdd.setConfig();
                  handleReplaceAllTemplate();
                  setReplaceModule(false);
                }}
              >
                替换全部片段
              </Button>
            )}
          </div>
          <Checkbox
            onChange={e => {
              moduleForAdd.setState(e.target.checked);
            }}
          >
            默认添加为新片段，不再提醒。
          </Checkbox>
        </div>
      </NoTitleModal>
    </>
  );
};
export default memo(TemplateItem);
