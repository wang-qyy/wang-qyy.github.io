import { PropsWithChildren } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import { useDrop as useDndDrop } from 'react-dnd';

import './index.less';
import { Upload } from 'antd';

interface DragUploadProps {
  onFinish: (params: File[]) => void;
  contentClassName?: string;
  deps: any[];
}

export default function DragUpload(props: PropsWithChildren<DragUploadProps>) {
  const { children, onFinish, contentClassName, deps } = props;

  const [{ isOverContent }, drop] = useDndDrop(() => ({
    accept: '__NATIVE_FILE__',
    collect: monitor => {
      const overCurrent = monitor.isOver({ shallow: true });
      return {
        isOverContent: overCurrent,
      };
    },
  }));

  const [{ isOverMask }, dropMask] = useDndDrop(
    () => ({
      accept: '__NATIVE_FILE__',
      collect: monitor => {
        const overCurrent = monitor.isOver({ shallow: true });
        return {
          isOverMask: overCurrent,
        };
      },
      drop(item) {
        onFinish(item.files);
      },
    }),
    deps,
  );

  return (
    <div
      className={classNames('drag-upload', {
        'upload-file-dragenter': isOverMask || isOverContent,
      })}
    >
      <div className="dragenter-mask" ref={dropMask}>
        <div className="drag-upload-icon">
          <PlusOutlined style={{ fontSize: 24 }} />
        </div>

        <p className="dragenter-desc">拖放到此处以上传文件</p>
      </div>
      <div
        className={classNames('drag-upload-content', contentClassName)}
        ref={drop}
        style={{
          pointerEvents: isOverMask || isOverContent ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
