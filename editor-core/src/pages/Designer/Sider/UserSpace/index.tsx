import { useSetState } from 'ahooks';
import { useState } from 'react';
import { Button, Upload } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { beforeFileUpload, UploadFileType } from '@/utils/uploader';

import { SiderTabs } from '../components/SiderTabs';
import SiderTabPanel from '../components/SiderTabPanel';
import Image from './Image';
import VideoEList from './Video';
import Music from './Music';
import styles from './index.modules.less';

export default function UserSpace() {
  const [activeKey, setActiveKey] = useState<UploadFileType>('image');
  const [addItem, setAddItem] = useSetState<{
    image: any[];
    video: any[];
  }>({ image: [], video: [] });

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.title}>我的资源</div>
        <Upload
          showUploadList={false}
          beforeUpload={file => {
            const fileType = file.type.split('/')[0] as UploadFileType;
            setActiveKey(fileType);

            return beforeFileUpload(file, fileType, (isAccept, params) => {
              if (isAccept) {
                setAddItem({
                  [fileType]: [
                    {
                      ...params,
                      title: file.name,
                      step: 'pending',
                      preview: params.fileURL,
                      id: file.uid,
                    },
                    ...addItem[fileType],
                  ],
                });
              }
            });
          }}
        >
          <Button icon={<CloudUploadOutlined />} type="default">
            上传素材
          </Button>
        </Upload>
      </div>
      <SiderTabs
        activeKey={activeKey}
        className="xdd-designer-sider-tab-default"
        closeable={false}
        onChange={key => setActiveKey(key)}
      >
        {/* <SiderTabPanel tab="全部" key="all" style={{ overflow: 'hidden' }}>
          <Image />
        </SiderTabPanel> */}

        <SiderTabPanel tab="图片" key="image" style={{ overflow: 'hidden' }}>
          <Image uploadFile={addItem.image} />
        </SiderTabPanel>

        <SiderTabPanel tab="视频" key="video" style={{ overflow: 'hidden' }}>
          <VideoEList uploadFile={addItem.video} />
        </SiderTabPanel>
        {/* <SiderTabPanel tab="音乐" key="audio" style={{ overflow: 'hidden' }}>
          <Music />
        </SiderTabPanel> */}
      </SiderTabs>
    </div>
  );
}
