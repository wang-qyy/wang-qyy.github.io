import { Tooltip, Menu, Dropdown } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { useGetDownload } from '@/hooks/useDownload';
import { downloadClickWebLog } from '@/utils/webLog';
import { CaretDownOutlined } from '@ant-design/icons';
import styles from './index.less';

function ShareDropdown(props: { setPlatform: (str: string) => void }) {
  const { setPlatform } = props;
  const { open } = useGetDownload();

  const menu = (
    <Menu
      className={styles.shareDropdownMenu}
      onClick={e => {
        downloadClickWebLog();
        open();
        setPlatform(e.key);
      }}
    >
      {[
        {
          icon: 'icondiannao',
          name: '',
          txt: '下载到电脑',
        },
        // {
        //   icon: 'icona-douyin5',
        //   name: '抖音',
        //   txt: '发布到抖音',
        // },
        // {
        //   icon: 'icona-shipinhao11',
        //   name: '视频号',
        //   txt: '发布到视频号',
        // },
        {
          icon: 'icona-kuaishou1',
          name: 'kuaishou',
          txt: '发布到快手',
        },
      ].map(item => {
        return (
          <Menu.Item key={item.name} className={styles.shareDropdownMenuItem}>
            <XiuIcon
              type={item.icon}
              className={styles.shareDropdownMenuItemIcon}
            />
            {item.txt}
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <div className={styles['down-load']} id="down-load">
      <Tooltip title="下载" getTooltipContainer={ele => ele}>
        <div
          className={styles['down-load-left']}
          onClick={() => {
            downloadClickWebLog();
            setPlatform('');
            open();
          }}
        >
          <XiuIcon
            type="iconxiazai1"
            className={styles['down-load-left-icon']}
          />
          {/* className="xiudodo-header-item-desc" */}
          <span>高清视频下载</span>
        </div>
      </Tooltip>
      <Dropdown
        overlay={menu}
        trigger={['click']}
        getPopupContainer={() =>
          document.getElementById('xiudodo') as HTMLElement
        }
      >
        <span className={styles['down-load-right']}>
          <CaretDownOutlined style={{ fontSize: '17px' }} />
        </span>
      </Dropdown>
    </div>
  );
}

export default ShareDropdown;
