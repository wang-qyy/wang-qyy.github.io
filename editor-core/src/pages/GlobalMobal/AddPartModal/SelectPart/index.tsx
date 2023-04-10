import React, { useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { Checkbox, Button } from 'antd';
import { getTemplateInfo, TemplateItem } from '@/api/template';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import { formatRawData } from '@/utils/simplify';
import { addTemplate } from '@/utils/templateHandler';
import { usePartModal } from '@/store/adapter/useGlobalStatus';
import { useGetCanvasInfo } from '@/kernel/store';
import { clickActionWeblog } from '@/utils/webLog';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import styles from './index.modules.less';

interface IProps {
  template: TemplateItem | null;
  onBack: () => void;
  cancel: () => void;
  shape: string;
}

const SelectPart: React.FC<IProps> = props => {
  const { template, onBack, shape, cancel } = props;
  const [hovered, _hovered] = useState<string | null>(null);
  const [checkedList, _checkedList] = useState<string[]>([]);
  const { width: canvasW, height: canvasH } = useGetCanvasInfo();
  const {
    partModal: { currentIndex },
    changePartModal,
  } = usePartModal();

  const width = shape === 'h' ? 172 : 216;

  const itemStyle = {
    width,
    height: width * (canvasH / canvasW),
  };

  const { data, run, mutate } = useRequest(getTemplateInfo, {
    manual: true,
  });

  const list = data?.doc.pageAttr.pageInfo;

  useEffect(() => {
    if (!template) {
      data && mutate(undefined);
      _checkedList([]);
      return;
    }
    run({ picId: template.id });
  }, [template]);

  const onSelectAll = () => {
    if (list && checkedList.length !== list.length) {
      _checkedList(list?.map(t => t.tid));
      return;
    }
    _checkedList([]);
  };

  const checkChange = (id: string, checked: boolean) => {
    if (checked) {
      _checkedList([...checkedList, id]);
    } else {
      const index = checkedList.findIndex(t => t === id);
      if (index !== -1) {
        checkedList.splice(index, 1);
        _checkedList([...checkedList]);
      }
    }
  };

  const onAdd = () => {
    const newWork = checkedList.map(id => {
      const index = Number(id.split('.')[1]) || 0;
      return data?.doc.work[index];
    });
    data!.doc.work = newWork;
    const rawData = formatRawData({
      ...data,
      doc: {
        ...data?.doc,
        work: newWork,
      },
    });

    // console.log('totalPageTime', rawData.totalPageTime);

    let incrementalPageTime = 0;

    rawData.forEach(item => {
      incrementalPageTime += item.pageAttr.pageInfo.pageTime;
    });

    addTemplate({
      index: currentIndex,
      templates: rawData,
      incrementalPageTime,
      warnAssets: data?.assets,
    });
    // 从模板添加
    clickActionWeblog('AddPartModal6');
    cancel();
  };
  const partClip = useMemo(() => {
    const clips: Array<[number, number]> = [];
    if (data && data.doc.pageAttr.pageInfo.length) {
      data.doc.pageAttr.pageInfo.reduce((pre, cur) => {
        const { pageTime = 0 } = cur || {};
        const next = pre + pageTime;
        clips.push([pre, next]);
        return next;
      }, 0);
    }
    return clips;
  }, [data]);
  return (
    <div
      className={classNames(styles.SelectPart, {
        [styles.show]: !!template,
      })}
    >
      <div className={styles.header}>
        <div className={styles.title}>选择您要插入的场景页</div>
        <div className={styles.back} onClick={onBack}>
          <XiuIcon className={styles.backIcon} type="iconjiantouyou" /> 返回
        </div>
      </div>
      <div className={styles.selectAll}>
        <Checkbox
          indeterminate={
            !!checkedList.length && checkedList.length < (list?.length ?? 0)
          }
          checked={list && checkedList.length === list.length}
          onChange={onSelectAll}
        >
          全选
        </Checkbox>
      </div>
      <div className={styles.body}>
        <div className={styles.list}>
          {data &&
            data.doc.pageAttr.pageInfo.map((item, index) => (
              <div
                key={item.tid}
                onMouseEnter={() => _hovered(item.tid)}
                onMouseLeave={() => _hovered(null)}
                className={styles.item}
                onClick={() =>
                  checkChange(item.tid, !checkedList.includes(item.tid))
                }
                style={{
                  backgroundImage: `url(${item.rt_preview_image})`,
                  ...itemStyle,
                }}
              >
                <AutoDestroyVideo
                  poster={item.rt_preview_image}
                  clip={partClip.length ? partClip[index] : undefined}
                  playing={hovered === item.tid}
                  src={data?.info && data.info.small_url}
                />
                <div className={styles.checkbox}>
                  <Checkbox
                    checked={checkedList.includes(item.tid)}
                    onChange={e => checkChange(item.tid, e.target.checked)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className={styles.footer}>
        <Button
          style={{ width: 231, height: 42 }}
          type="primary"
          onClick={onAdd}
          disabled={!checkedList.length}
        >
          添加所选片段
        </Button>
      </div>
    </div>
  );
};

export default SelectPart;
