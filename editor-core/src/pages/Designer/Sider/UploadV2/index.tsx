import { PropsWithChildren, useState } from 'react';
import { Button, Modal, Tabs } from 'antd';
import { useRequest, useUpdateEffect } from 'ahooks';
import { InfoCircleFilled } from '@ant-design/icons';

import { getUserImages, getUserVideoE } from '@/api/images';
import { getVideoFileStatus } from '@/api/upload';
import UploadModule from './UploadModule';
import ImageUploadModule from './UploadModule/Image';
import { FileStatus } from './uploader';

import List from './List';
import VideoItem from './VideoItem';
import ImageItem from './ImageItem';

import styles from './index.modules.less';

/**
 * @params status
 * @eg 1 合成完成
 * @eg 0 合成中
 * */
function ItemWrap({
  status,
  children,
  reload,
}: PropsWithChildren<{ status: FileStatus; reload: any }>) {
  useUpdateEffect(() => {
    if (status === 'done') {
      reload();
    }
  }, [status]);

  function fileStatus() {
    switch (status) {
      case 'fail':
        return (
          <>
            <InfoCircleFilled style={{ fontSize: 20, color: '#FE822A' }} />
            <p style={{ color: 'red' }}>合成失败!</p>
          </>
        );
      default:
        return '合成中…';
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        hidden={status === 'done'}
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          position: 'absolute',
          zIndex: 10,
          width: '100%',
          height: '100%',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 12,
        }}
      >
        {fileStatus()}
      </div>

      {children}
    </div>
  );
}

export default function Upload() {
  const [uploadModal, setUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'lottie' | 'png' | 'bg'>('lottie');
  const [ids, setIds] = useState<string[]>([]);

  const [reload, setReload] = useState(false);

  const { run, cancel } = useRequest(getVideoFileStatus, {
    manual: true,
    pollingInterval: 2000,
    onSuccess(res) {
      const newIds: string[] = [];

      Object.keys(res).forEach(key => {
        const item = res[key];
        if (item.step !== 'done') {
          newIds.push(key);
        }
      });

      if (newIds.length < 1) {
        cancel();
        setReload(true);
      }

      setIds(newIds);
    },
  });

  function onUploadFinish(fileId: string) {
    cancel();
    setUploadModal(false);

    // 轮询视频合成状态
    if (activeTab !== 'png') {
      setIds(preState => {
        const newIds = [...preState, String(fileId)];
        run(newIds);

        return newIds;
      });
    }

    setReload(true);
  }

  return (
    <div className={styles['upload-list']}>
      <div className={styles.header}>
        <span>上传</span>
        <Button type="primary" onClick={() => setUploadModal(true)}>
          上传素材
        </Button>
      </div>

      <Tabs
        onChange={setActiveTab}
        destroyInactiveTabPane
        className={styles['upload-list-tabs']}
      >
        <Tabs.TabPane tab="视频元素" key="lottie">
          <List
            reload={reload}
            setReload={setReload}
            type="lottie"
            request={getUserVideoE}
            Item={props => {
              const { data, reload, ...others } = props;

              return (
                <ItemWrap
                  status={ids.includes(data.id) ? 0 : data.step}
                  reload={reload}
                >
                  <VideoItem data={data} {...others} />
                </ItemWrap>
              );
            }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="图片" key="png">
          <List
            type="png"
            reload={reload}
            setReload={setReload}
            request={getUserImages}
            Item={ImageItem}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="背景视频" key="bg">
          <List
            reload={reload}
            setReload={setReload}
            type="bg"
            request={getUserVideoE}
            Item={props => {
              const { data, reload, ...others } = props;

              return (
                <ItemWrap
                  status={ids.includes(data.id) ? 0 : data.step}
                  reload={reload}
                >
                  <VideoItem isBackground data={data} {...others} />
                </ItemWrap>
              );
            }}
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        keyboard={false}
        visible={uploadModal}
        destroyOnClose
        width="950px"
        onCancel={() => setUploadModal(false)}
        maskClosable={false}
        // closable={false}
        footer={null}
        centered
      >
        <UploadModule onOk={onUploadFinish} scope_type={activeTab} />
      </Modal>
    </div>
  );
}
