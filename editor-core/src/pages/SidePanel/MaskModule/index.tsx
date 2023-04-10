import { useState } from 'react';
import { Popover } from 'antd';
import { debounce } from 'lodash-es';
import LazyLoadComponent from '@/components/LazyLoadComponent';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { handleAddModule } from '@/utils/assetHandler';
import { clickActionWeblog } from '@/utils/webLog';
import Recommend from './Recommend';
import More from './More';
import './index.less';
import Preview from './Preview';

export default function MaskModule() {
  const {
    leftSideInfo: { submenu },
  } = useLeftSideInfo();

  const [preview, setPreview] = useState();

  const handleSetPreview = debounce(setPreview, 500);

  function onAddModule(data: any) {
    clickActionWeblog('action_module_add', { action_label: data.id });
    handleAddModule(data.id);
  }

  return (
    <Popover
      placement="rightTop"
      visible={!!preview}
      content={<Preview url={preview?.smallUrl} />}
      getPopupContainer={ele => ele}
      overlayClassName="module-priview-popover"
    >
      <div className="maskModule">
        <LazyLoadComponent visible={!submenu}>
          <Recommend setPreview={handleSetPreview} onAdd={onAddModule} />
        </LazyLoadComponent>
        <LazyLoadComponent visible={Boolean(submenu)}>
          <More setPreview={handleSetPreview} onAdd={onAddModule} />
        </LazyLoadComponent>
      </div>
    </Popover>
  );
}
