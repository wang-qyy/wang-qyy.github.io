import { MouseEvent, PropsWithChildren } from 'react';
import { Tooltip, Modal, Checkbox, Divider } from 'antd';

import { clickActionWeblog } from '@/utils/webLog';
import XiuIcon from '@/components/XiuIcon';

interface SelectedProps {
  amount: number;
  onDelete: (e: MouseEvent<any>) => void;
  hidden?: boolean;
  onCancel: (e: MouseEvent<any>) => void;
  onSelectAll: (isAll: boolean) => void;
  isSelectedAll?: boolean;
}

export default function Selected(props: PropsWithChildren<SelectedProps>) {
  const { amount, onDelete, onCancel, onSelectAll, isSelectedAll, ...others } =
    props;

  return (
    <div
      style={{
        padding: '6px 16px',
        backgroundColor: '#fff',
        display: amount ? 'flex' : 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      {...others}
    >
      <div>
        <Checkbox
          // indeterminate={!isSelectedAll}
          onChange={e => {
            onSelectAll(e.target.checked);
          }}
          checked={isSelectedAll}
        >
          <span style={{ color: '#262E48', fontSize: 12 }}>
            已选<span style={{ color: '#8676e8' }}>{amount}</span>个
          </span>
        </Checkbox>

        <Divider type="vertical" />

        <Tooltip
          title="批量删除"
          overlayClassName="tooltip-overlayClassName"
          getPopupContainer={() =>
            document.getElementById('xiudodo') as HTMLElement
          }
        >
          <span
            className="file-action-deleted"
            onClick={() => {
              clickActionWeblog('action_upload_delete');

              Modal.confirm({
                title: '删除文件',
                content: (
                  <p>
                    确定要删除选中的
                    <span
                      style={{
                        fontSize: 16,
                        color: '#8676e8',
                        fontWeight: 'bold',
                        padding: '0 6px',
                      }}
                    >
                      {amount}
                    </span>
                    个文件？
                  </p>
                ),
                okText: '确定',
                cancelText: '再想想',
                onOk: onDelete,
              });
            }}
          >
            <XiuIcon type="iconshanchu" />
            <span> 删除</span>
          </span>
        </Tooltip>
      </div>
      <Tooltip title="退出删除" overlayClassName="tooltip-overlayClassName">
        <span className="file-selected-exit" onClick={onCancel}>
          退出
        </span>
      </Tooltip>
    </div>
  );
}
