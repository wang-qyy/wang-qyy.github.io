import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, message, Modal } from 'antd';

import Skeleton from '@/components/Skeleton';

import {
  useCurrentTemplate,
  getTemplateIndexById,
  RawTemplateData,
  observer,
  getValidAssets,
  getAllTemplates,
} from '@hc/editor-core';

import NoTitleModal from '@/components/NoTitleModal';

import SidePanelWrap from '@/components/SidePanelWrap';
import useEditorConfig, { getConfig } from '@/hooks/useEditorConfig';
import useAddTemplate from '@/hooks/useAddTemplate';
import { clickActionWeblog } from '@/utils/webLog';
import TemplatePart from './TemplatePart';
import styles from './index.modules.less';

function Index({
  templateBaseInfo,
  goBack,
  type,
}: {
  templateBaseInfo: any;
  goBack: any;
  type: 'draft' | 'temptale' | 'collection';
}) {
  const modulePartForAdd = useEditorConfig('modulePartForAdd');
  const allModulePartForAdd = useEditorConfig('allModulePartForAdd');

  const [replacePart, setReplacePart] = useState(false);
  const [replaceModule, setReplaceModule] = useState(false);
  const [partData, setPartData] = useState<RawTemplateData | undefined>();
  const { template } = useCurrentTemplate();
  // console.log(toJS(template));

  const [action, setAction] = useState<any>();

  const currentTempIndex = useMemo(() => {
    if (template?.id) return getTemplateIndexById(template.id);
  }, [template?.id]);

  const {
    insertTemplate,
    handleReplaceAllTemplate,
    runGetTemplate,
    loading,
    handleReplace,
    insertAllTemplates,
    parts,
    switchDraft,
    isDifferCurrentSize,
  } = useAddTemplate(templateBaseInfo);

  const partClip = useMemo(() => {
    const clips: Array<[number, number]> = [];
    if (parts.length) {
      parts.reduce((pre, cur) => {
        const { pageTime = 0 } = cur?.pageAttr?.pageInfo || {};
        const next = pre + pageTime;
        clips.push([pre, next]);
        return next;
      }, 0);
    }
    return clips;
  }, [parts]);

  function beforeInsertTemplate(
    part: RawTemplateData,
    action: { trigger: 'click' | 'drag'; dropContainer: 'bottom' | 'part' },
  ) {
    const { trigger, dropContainer } = action;

    if (getValidAssets().length === 0) {
      clickActionWeblog(
        // eslint-disable-next-line no-nested-ternary
        trigger === 'click'
          ? 'action_template_replace'
          : dropContainer === 'bottom'
          ? 'drag_replace_002 '
          : 'drag_replace_001',
        {
          action_label: type,
        },
      );

      handleReplace(part, currentTempIndex || 0);
    } else {
      if (modulePartForAdd.getConfig()) {
        insertTemplate(part, currentTempIndex);
      } else {
        if (isDifferCurrentSize) {
          Modal.info({
            title: '提示',
            content: '暂不支持添加/替换不同尺寸的片段',
            okText: '知道了',
          });
          return;
        }

        setAction(action);

        setPartData(part);
        setReplacePart(true);
      }
    }
  }

  function beforeInsertTemplates() {
    clickActionWeblog('template_applyAll');

    if (getValidAssets().length === 0 && getAllTemplates().length === 1) {
      clickActionWeblog('action_template_replaceAll', { action_label: type });
      // 只有一个空白片段
      handleReplaceAllTemplate();
    } else if (allModulePartForAdd.getConfig()) {
      clickActionWeblog('action_template_replaceAll', { action_label: type });
      insertAllTemplates(currentTempIndex);
    } else {
      setReplaceModule(true);
    }
  }

  // 获取模板数据
  useEffect(() => {
    if (type === 'draft') {
      runGetTemplate({ upicId: templateBaseInfo.id });
    } else {
      runGetTemplate({ picId: templateBaseInfo.id });
    }
  }, [templateBaseInfo.id]);

  return (
    <>
      <SidePanelWrap>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <span className={styles.back} onClick={goBack}>
              {'<  '}
              {templateBaseInfo.title}
            </span>

            {type === 'draft' && isDifferCurrentSize ? (
              <Button
                className={styles['replace-button']}
                onClick={() => {
                  switchDraft();
                  setReplacePart(false);
                  clickActionWeblog('action_template_replaceAll', {
                    action_label: type,
                  });
                }}
              >
                切换草稿
              </Button>
            ) : (
              <Button
                className={styles['replace-button']}
                onClick={beforeInsertTemplates}
              >
                应用全部{parts.length}页片段
              </Button>
            )}
          </div>

          <Skeleton loading={loading} columns={2}>
            <div className={styles.list}>
              {parts.map((part, index) => (
                <TemplatePart
                  data={part}
                  clip={partClip[index]}
                  key={part.templateId}
                  onClick={action => beforeInsertTemplate(part, action)}
                />
              ))}
            </div>
          </Skeleton>
        </div>
      </SidePanelWrap>
      <NoTitleModal
        visible={replacePart}
        footer={null}
        width={360}
        centered
        onCancel={() => {
          setPartData(undefined);
          setReplacePart(false);
          modulePartForAdd.setState(false);
        }}
      >
        <div className="replace-template-module">
          <h3>将模板添加为新页面？</h3>
          <div className="replace-button-box">
            <Button
              onClick={() => {
                modulePartForAdd.setConfig();
                handleReplace(partData!, currentTempIndex!);
                setReplacePart(false);
                clickActionWeblog(
                  // eslint-disable-next-line no-nested-ternary
                  action?.trigger === 'click'
                    ? 'action_template_replace'
                    : action?.dropContainer === 'bottom'
                    ? 'drag_replace_002 '
                    : 'drag_replace_001',
                  {
                    action_label: type,
                  },
                );
              }}
            >
              替换当前页面
            </Button>
            <Button
              type="primary"
              onClick={() => {
                modulePartForAdd.setConfig();
                insertTemplate(partData!, currentTempIndex);
                setReplacePart(false);

                clickActionWeblog(
                  // eslint-disable-next-line no-nested-ternary
                  action?.trigger === 'click'
                    ? 'action_template_insert'
                    : action?.dropContainer === 'canvas'
                    ? 'drag_add_001'
                    : 'drag_add_002',
                  {
                    action_label: type,
                  },
                );
              }}
            >
              添加为新页面
            </Button>
          </div>
          <Checkbox
            checked={modulePartForAdd.state}
            onChange={e => {
              modulePartForAdd.setState(e.target.checked);
            }}
          >
            默认添加为新页面，不再提醒。
          </Checkbox>
        </div>
      </NoTitleModal>
      <NoTitleModal
        visible={replaceModule}
        footer={null}
        width={360}
        centered
        onCancel={() => {
          setReplaceModule(false);
          allModulePartForAdd.setState(false);
        }}
      >
        <div className="replace-template-module">
          <h3>当前模板包含{parts.length}个片段</h3>
          <h3>是否全部替换当前所有页面?</h3>
          <div className="replace-button-box">
            <Button
              hidden={isDifferCurrentSize}
              onClick={() => {
                allModulePartForAdd.setConfig();
                insertAllTemplates(currentTempIndex);
                setReplaceModule(false);

                clickActionWeblog('action_template_insert', {
                  action_label: type,
                });
              }}
            >
              添加全部页面
            </Button>
            <Button
              type="primary"
              onClick={() => {
                clickActionWeblog('action_template_replaceAll', {
                  action_label: type,
                });
                allModulePartForAdd.setConfig();
                handleReplaceAllTemplate();
                setReplaceModule(false);
              }}
            >
              替换全部页面
            </Button>
          </div>
          <Checkbox
            value={allModulePartForAdd.state}
            onChange={e => {
              allModulePartForAdd.setState(e.target.checked);
            }}
          >
            默认添加为新页面，不再提醒。
          </Checkbox>
        </div>
      </NoTitleModal>
    </>
  );
}

export default observer(Index);
