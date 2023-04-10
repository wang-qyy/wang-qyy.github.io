import {
  observer,
  useGetCurrentInfoByObserver,
  groupModule,
  ungroupModule,
  isModuleType,
} from '@hc/editor-core';
import { Button } from 'antd';
import { useRef } from 'react';

export function useModuleHandler() {
  const { currentAsset, multiSelect } = useGetCurrentInfoByObserver();
  function action() {
    if (multiSelect?.length > 1) {
      groupModule();
    } else if (isModuleType(currentAsset)) {
      ungroupModule(currentAsset);
    }
  }
  return {
    action,
    buttonText: multiSelect?.length > 1 ? '组合' : '拆分组',
  };
}
const ModuleTab = observer(() => {
  const { action, buttonText } = useModuleHandler();

  const btnRef = useRef();

  return (
    <div style={{ padding: '0 18px' }}>
      <Button
        ref={btnRef}
        type="primary"
        block
        onClick={() => {
          action();
          btnRef.current?.blur();
        }}
      >
        {buttonText}
      </Button>
    </div>
  );
});
export default ModuleTab;
