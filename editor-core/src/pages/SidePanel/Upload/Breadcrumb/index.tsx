import { useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { useRequest } from 'ahooks';
import { getBreadNav } from '@/api/upload';
import './index.less';

export default function BreadMenu({
  folderId,
  onChange,
}: {
  folderId: string;
  onChange: (folderId: string) => void;
}) {
  const { run, data = [] } = useRequest(getBreadNav, {
    manual: true,
    onSuccess(res) {},
  });

  const menu = [
    {
      title: '全部',
      id: '0',
    },
  ].concat(data);

  useEffect(() => {
    if (folderId) {
      run(folderId);
    }
  }, [folderId]);

  return (
    <div className="upload-file-bread-menu">
      <Breadcrumb>
        {menu.map(item => {
          return (
            <Breadcrumb.Item
              key={`breadcrumb-${item.id}`}
              onClick={() => onChange(item.id)}
            >
              <span className="upload-file-bread-menu-item">{item.title}</span>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
}
