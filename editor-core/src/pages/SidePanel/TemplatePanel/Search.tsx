import { useState, useEffect } from 'react';
import { encode } from 'js-base64';
import { useSetState, useRequest } from 'ahooks';

import { getCanvasInfo, useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import SidePanelWrap from '@/components/SidePanelWrap';
import Search from '@/components/Search';
import { getTemplateClassify } from '@/api/template';
import { getCanvasShape } from '@/utils/templateHandler';

import List from './List';

import RatioRadio from './RatioRadio';

import './index.less';

const categoriesType = { g: '分类', c: '用途', d: '场景', i: '行业' };

function formatCategories(
  name: string,
  key: string,
  data: any,
  type?: 'radio' | 'button',
) {
  // 比例 shape
  // 分类 classes.g
  // // 用途 classes.c
  // // 场景 classes.d
  // // 行业 classes.i
  // 风格 tags.st
  let options;
  if (type === 'radio') {
    options = data.map(item => ({
      label: item.name,
      value: item.id,
    }));
  } else {
    options = data.map(item => ({
      label: item.name,
      value: item.params,
      checked: !!item.active,
      key: item.id,
    }));
  }

  return { key, label: name, type, options };
}

interface TemplateListProps {
  beforeReplace: (data: any) => void;
  request: any;
  type: 'template' | 'collection';
}

const TemplateList = ({ beforeReplace, request, type }: TemplateListProps) => {
  const { width, height } = getCanvasInfo();
  const [filters, setFilters] = useSetState(
    type === 'template'
      ? { filter: { shape: getCanvasShape() }, width, height }
      : { ratio: 1 },
  );

  const { value: canvasInfo } = useUpdateCanvasInfo();

  useEffect(() => {
    if (type === 'template') {
      setFilters({ filter: { shape: getCanvasShape() }, width, height });
    }
  }, [canvasInfo?.width, canvasInfo?.height]);

  // 模板分类列表
  const [categories, setCategories] = useState<any[]>([]);

  // 获取模板分类列表
  const { run: getClassify } = useRequest(getTemplateClassify, {
    // manual: true,
    onSuccess: data => {
      const shape = formatCategories('比例', 'shape', data.shape, 'radio');
      const style = formatCategories('风格', 'tags.st', data.tags.st);
      const classes = Object.keys(data.classes).map(key =>
        formatCategories(
          categoriesType[key],
          `classes.${key}`,
          data.classes[key],
        ),
      );

      const newData = [shape, ...classes, style];

      setCategories(newData);
    },
  });

  function onFilter(filter: any) {
    const { shape, ...others } = filter;

    // 清空时候，清空筛选
    setFilters({ filter: filter });
    // 刷新列表
    getClassify(encode(JSON.stringify(others)));
  }

  return (
    <SidePanelWrap
      search={
        type === 'template' ? (
          <Search
            searchKey="w"
            filters={categories}
            onChange={filter => setFilters({ w: filter.w })}
            onFilter={onFilter}
            placeholder="请输入关键词搜索"
            defaultValue={{ shape: getCanvasShape() }}
            className="template-categories"
            destroyFilterOnHide
          />
        ) : (
          <RatioRadio
            active={filters.ratio}
            onChange={value => {
              // setRadio(value.key);
              setFilters({ ratio: value.key });
            }}
          />
        )
      }
    >
      <List
        filters={filters}
        beforeReplace={beforeReplace}
        request={request}
        type={type}
      />
    </SidePanelWrap>
  );
};

export default TemplateList;
