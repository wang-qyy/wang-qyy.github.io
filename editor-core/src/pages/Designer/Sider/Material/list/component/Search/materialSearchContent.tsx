import { PropsWithChildren, useState } from 'react';
import InfiniteLoader from '@/components/InfiniteLoader';
import { getMaterialTypeList } from '@/api/material';
import { formater } from '@/pages/Designer/Sider/Material/formater';
import MaterialItem from '@/pages/Designer/Sider/components/MaterialItem';
import SearchCatalog from './catalog';

interface MaterialListProps {
  search?: string; // 搜索关键词
  type: string;
  tag?: boolean; // 分类
  request?: (params: any) => Promise<any>;
  class_id?: string;
}

const MaterialList = (props: PropsWithChildren<MaterialListProps>) => {
  const { search, type = 'shape', tag = false, request, class_id } = props;

  const [tagId, setTagId] = useState(''); // 分类

  return (
    <>
      {tag && <SearchCatalog type={type} changeTag={setTagId} tag={tagId} />}

      <InfiniteLoader
        request={request || getMaterialTypeList}
        params={{
          type,
          pageSize: 40,
          keyword: search,
          class_id: class_id ?? tagId,
        }}
        wrapStyle={{ flex: 1, height: 0 }}
        skeleton={{
          style: {
            padding: '0 18px 0 18px',
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill,minmax(98px,1fr))',
            alignContent: 'flex-start',
          },
        }}
      >
        {({ list }) => {
          return (
            <>
              {list.map(ele => (
                <MaterialItem
                  {...formater(ele, type)}
                  style={{ width: 'auto', height: 98 }}
                  key={ele.id}
                  src={ele.preview}
                  poster={ele.preview}
                />
              ))}
            </>
          );
        }}
      </InfiniteLoader>
    </>
  );
};
export default MaterialList;
