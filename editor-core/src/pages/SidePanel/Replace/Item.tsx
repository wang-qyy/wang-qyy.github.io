import { PropsWithChildren } from 'react';
import classNames from 'classnames';

import { ElementWrap } from '@/CommonModule/ElementActions';
import { config } from './config';
import DragBox from '@/components/DragBox';

export function getMetaType(type: string) {
  switch (type) {
    case 'svg':
      return 'SVG';
    case 'gif':
      return 'videoE';
    default:
      return type;
  }
}

const getBaseAttribute = (params: any) => ({
  resId: params.id,
  width: params.width,
  height: params.height,
});

interface ItemProps {
  data: any;
  type: 'image' | 'videoE' | 'element';
  onSuccess?: () => void;
}

export default function Item(props: PropsWithChildren<ItemProps>) {
  const { data, type, onSuccess } = props;
  const { getAttribute } = config[type];
  const dragAsset = {
    meta: {
      type: getMetaType(data.asset_type),
    },
    attribute: {
      ...getBaseAttribute(data),
      ...getAttribute(data),
    },
  };

  return (
    <DragBox
      data={dragAsset}
      type={dragAsset.meta?.type}
      onDrop={() => {
        onSuccess && onSuccess();
      }}
    >
      <ElementWrap
        data={dragAsset.attribute}
        type={type === 'element' ? dragAsset.meta?.type : type}
        style={{ height: 86, backgroundColor: '#e9ebed' }}
        className={classNames('replace-element-item', {
          'replace-element-item-small': type === 'element',
        })}
        onSuccess={onSuccess}
      />
    </DragBox>
  );
}
