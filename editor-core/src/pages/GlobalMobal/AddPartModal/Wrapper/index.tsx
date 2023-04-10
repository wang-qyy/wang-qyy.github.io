import {
  getTemplateClassify,
  getTemplateInfo,
  getTemplateList,
  getTemplateSingleList,
  TemplateItem,
} from '@/api/template';
import { usePartModal } from '@/store/adapter/useGlobalStatus';
import { useRequest } from 'ahooks';
import { debounce } from 'lodash-es';
import classNames from 'classnames';
import { ReactText, useEffect, useMemo, useRef, useState } from 'react';
import { encode } from 'js-base64';

import Search from '@/components/Search';
import { formatRawData } from '@/utils/simplify';
import { addTemplate, getCanvasShape } from '@/utils/templateHandler';
import { getCanvasInfo, useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import getUrlProps from '@/utils/urlProps';
import { clickActionWeblog } from '@/utils/webLog';

import TemplateList from '../TemplateList';
import SelectPart from '../SelectPart';
import Preview from '../Preview';
import Filter from '../Filter';
import styles from './index.modules.less';
import { pageSize } from '../options';

const Wrapper = (props: { getCancel: (fc: Function) => void }) => {
  const { getCancel } = props;
  const {
    partModal: { currentIndex },
    changePartModal,
  } = usePartModal();
  const [filter, setFilter] = useState<Record<string, any>>({});
  const [keyWord, setKeyWord] = useState('');
  const [template, setTemplate] = useState<TemplateItem | null>(null);
  const [previewItem, setPreviewItem] = useState<TemplateItem | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [orderby, setOrderby] = useState<ReactText>(0);
  const [isSingle, setIsSingle] = useState(true);

  const { templateInfo } = useTemplateInfo();
  const { last_templ_id, picId } = templateInfo;
  const { width, height } = getCanvasInfo();

  const urlProps = getUrlProps();

  const template_id = urlProps.picId || picId || last_templ_id;
  const shape = getCanvasShape();

  // 筛选列表
  const { data: filterData, run: getFilterData } = useRequest(
    getTemplateClassify,
    {
      manual: true,
    },
  );

  const getLoadMoreList = async (info: any, params: any, single: boolean) => {
    const page = info?.page || 1;
    params.p = page;
    let result;
    if (single) {
      result = await getTemplateSingleList(params);
    } else {
      result = await getTemplateList(params);
    }

    const { data: resData } = result;

    const isNoMore = page >= resData.pageTotal;

    return {
      list: resData.items,
      isNoMore,
      page: page + 1,
      totalCount: resData.totalCount,
    };
  };

  const params = useMemo(() => {
    const filters = { ...filter, shape };
    const filterStr = encode(JSON.stringify(filters));

    return {
      template_id,
      w: keyWord,
      // p: page,
      filter: filterStr,
      orderby,
      page_size: keyWord ? pageSize + 1 : pageSize, // 有搜索时，不需要添加空白片段
      width,
      height,
    };
  }, [filter, orderby, keyWord, template_id, shape, width, height]);

  const { data } = useRequest(d => getLoadMoreList(d, params, isSingle), {
    loadMore: true,
    ref: scrollRef,
    isNoMore: d => !!d?.isNoMore,
    refreshDeps: [params, isSingle],
    threshold: 100,
  });

  useEffect(() => {
    const filters = { ...filter, shape };
    const filterStr = encode(JSON.stringify(filters));
    getFilterData(filterStr);
  }, [filter, shape]);

  const { run: getInfo } = useRequest(getTemplateInfo, {
    manual: true,
  });

  const cancel = () => {
    changePartModal({ visible: false });
    setKeyWord('');
  };

  useEffect(() => {
    getCancel(cancel);
    // 弹框曝光
    clickActionWeblog('AddPartModal1');
  }, []);

  useEffect(() => {
    if (isSingle) {
      // 片段列表展示曝光的uv/pv
      clickActionWeblog('AddPartModal2');
      return;
    }
    // 模版列表展示曝光的uv/pv
    clickActionWeblog('AddPartModal7');
  }, [isSingle]);

  const addSingleTemplate = (record: TemplateItem) => {
    getInfo({
      picId: record.template_id,
    }).then(info => {
      const rawData = formatRawData(info);
      const part = rawData[record.jump];

      addTemplate({
        index: currentIndex,
        templates: [part],
        incrementalPageTime: part.pageAttr.pageInfo.pageTime,
        warnAssets: info.assets,
      });
      // 添加片段
      clickActionWeblog('AddPartModal5');
      cancel();
    });
  };

  const addPart = (record?: TemplateItem) => {
    if (!record) {
      addTemplate({ index: currentIndex });
      // 添加空白模板
      clickActionWeblog('AddPartModal3');
      cancel();
      return;
    }
    if (isSingle) {
      addSingleTemplate(record);
    } else {
      setTemplate(record);
    }
  };

  const switchTemType = (single: boolean) => {
    setIsSingle(single);
    setPreviewItem(null);
  };

  return (
    <div className={styles.wrapper}>
      <SelectPart
        template={template}
        shape={shape}
        cancel={cancel}
        onBack={() => {
          setTemplate(null);
        }}
      />
      <div className={styles.header}>
        <div className={styles.title}>模板/片段库</div>
        <div className={styles.right}>
          <Search
            className={styles.search}
            searchKey="keyword"
            onChange={debounce(option => {
              // 触发搜索
              clickActionWeblog('AddPartModal4');
              setKeyWord(option.keyword);
            }, 200)}
            placeholder="搜索关键词"
          />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.aside}>
          <div
            className={classNames(styles.templateType, {
              [styles.active]: isSingle,
            })}
            onClick={() => {
              switchTemType(true);
            }}
          >
            单片段
          </div>
          <div
            className={classNames(styles.templateType, {
              [styles.active]: !isSingle,
            })}
            onClick={() => {
              switchTemType(false);
            }}
          >
            模板
          </div>
        </div>
        <div className={styles.content}>
          {previewItem && (
            <Preview
              onBack={() => setPreviewItem(null)}
              shape={shape}
              previewItem={previewItem}
              isSingle={isSingle}
            />
          )}
          {keyWord && data?.totalCount && (
            <p className={styles.result}>
              搜索结果: 共搜索到 “<span>{keyWord}</span>” 模板
              <span>{data?.totalCount}</span>套
            </p>
          )}
          <Filter
            onFilterChange={setFilter}
            filterData={filterData}
            onOrderbyChange={setOrderby}
          />
          <TemplateList
            onPreview={setPreviewItem}
            onAdd={addPart}
            keyword={keyWord}
            // setRef={ref => scrollRef.current === ref}
            ref={scrollRef}
            data={data?.list}
            isSingle={isSingle}
          />
        </div>
      </div>
    </div>
  );
};

export default Wrapper;
