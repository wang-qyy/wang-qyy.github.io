import { ReactChild, useEffect, useLayoutEffect } from 'react';
import { Layout, message } from 'antd';
import './index.less';
import { windowsLoading, windowBeforeUnload } from '@/utils/single';
import { useEditMode, useTimelineMode } from '@/store/adapter/useGlobalStatus';
import { useVideoHandler } from '@/kernel';
import TimeLinePage from '../TimeLinePage';
import { editorPageLog } from '@/utils/common';

const { Header, Content } = Layout;

export interface LayoutProps {
  header: ReactChild;
  content: ReactChild;
}

message.config({
  top: 200,
  duration: 2,
  maxCount: 1,
});

const XiudodoLayout = ({ header, content }: LayoutProps) => {
  const { setCurrentTime, currentTime } = useVideoHandler();
  const { timeLinePartKey, setTimeLinePartKey } = useTimelineMode();
  const { editMode } = useEditMode();

  useLayoutEffect(() => {
    windowsLoading.closeWindowsLoading();
    return () => {};
  }, []);

  // TODO: 应改为画布加载或者卸载不重置时间
  useLayoutEffect(() => {
    setTimeout(() => {
      setCurrentTime(currentTime);
    }, 1);
  }, [timeLinePartKey]);

  useEffect(() => {
    editorPageLog(editMode);
  }, []);

  return (
    <>
      {timeLinePartKey !== null && (
        <TimeLinePage
          partKey={timeLinePartKey as number}
          onClose={() => {
            setTimeLinePartKey(null);
          }}
        />
      )}
      <Layout className="xiudodo-layout" style={{ overflow: 'hidden' }}>
        <Header>{header}</Header>
        <Content>{content}</Content>
      </Layout>
    </>
  );
};
export default XiudodoLayout;
