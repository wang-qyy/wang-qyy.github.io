import React, { useState } from 'react';
import { encode } from 'js-base64';
import { useSetState, useRequest } from 'ahooks';

import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import SidePanelWrap from '@/components/SidePanelWrap';
import Search from '@/components/Search';
import { getTemplateClassify } from '@/api/template';

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
  const [filters, setFilters] = useSetState({ ratio: 1 });

  return (
    <SidePanelWrap
      search={
        <RatioRadio
          active={filters.ratio}
          onChange={value => {
            setFilters({ ratio: value.key });
          }}
        />
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
