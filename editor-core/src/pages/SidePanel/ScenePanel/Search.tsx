import { useState, useEffect } from 'react';
import { encode } from 'js-base64';
import { useSetState, useRequest } from 'ahooks';

import {
  getCanvasInfo,
  useUpdateCanvasInfo,
} from '@/store/adapter/useTemplateInfo';
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

interface SceneListProps {
  request: any;
  type: 'all' | 'collection';
}

const SceneList = ({ request, type }: SceneListProps) => {
  const [filters, setFilters] = useSetState(
    type === 'all' ? { filter: { shape: getCanvasShape() } } : { ratio: 1 },
  );

  const { value: canvasInfo } = useUpdateCanvasInfo();

  useEffect(() => {
    if (type === 'all') {
      setFilters({ filter: { shape: getCanvasShape() } });
    }
  }, [canvasInfo?.width, canvasInfo?.height]);

  // 场景分类列表
  const [categories, setCategories] = useState<any[]>([]);

  // 获取场景分类列表
  const { run: getClassify } = useRequest(getTemplateClassify, {
    // manual: true,
    onSuccess: data => {
      const style = formatCategories('风格', 'tags.st', data.tags.st);
      const classes = Object.keys(data.classes).map(key =>
        formatCategories(
          categoriesType[key],
          `classes.${key}`,
          data.classes[key],
        ),
      );

      const newData = [...classes, style];

      setCategories(newData);
    },
  });

  return (
    <SidePanelWrap
      search={
        type === 'all' ? (
          <Search
            searchKey="w"
            filters={categories}
            onChange={filter => {
              setFilters(filter);
            }}
            onFilter={filter => {
              // const newFilter = { ...filters.filter, ...filter };
              // 清空的时候，分类也要清空
              setFilters({ filter: filter });
              getClassify(encode(JSON.stringify(filter)));
            }}
            placeholder="请输入关键词搜索"
            defaultValue={{ shape: getCanvasShape() }}
            className="scene-categories"
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
      <List filters={filters} request={request} type={type} />
    </SidePanelWrap>
  );
};

export default SceneList;
