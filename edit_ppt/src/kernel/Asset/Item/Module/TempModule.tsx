import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import { useModuleStyle } from '@kernel/Asset/Item/Module/hooks';

const TempModule = observer((props: AssetItemProps) => {
  const style = useModuleStyle(props);
  return <div className="asset-module" style={style} />;
});
export default TempModule;
