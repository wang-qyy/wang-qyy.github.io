import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import Module from '@kernel/Asset/Item/Module/Module';
import TempModule from '@kernel/Asset/Item/Module/TempModule';

const ModuleIndex = observer((props: AssetItemProps) => {
  const { asset } = props;
  const { type } = asset.meta;

  if (type === '__module') {
    return <TempModule {...props} />;
  }
  return <Module key={type} {...props} />;
});
export default ModuleIndex;
