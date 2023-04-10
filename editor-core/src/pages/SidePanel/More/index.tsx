import { XiuIcon } from '@/components';
import { useMoreMenu } from '@/store/adapter/useGlobalStatus';
import { getUserId } from '@/store/adapter/useUserInfo';
import classnames from 'classnames';
import { useSideBar } from '@/hooks/useSideBar';
import { clickActionWeblog } from '@/utils/webLog';
import './index.less';

function More() {
  const { delSideMenu, bindMouseDown } = useSideBar();
  const { moreMenu } = useMoreMenu();
  const userId = getUserId();

  const { menuList } = moreMenu || { menuList: [] };

  // 获取侧边栏显示菜单数组
  const moreMunuList = menuList?.filter((item: any) => {
    return item.display === 0;
  });

  return (
    <>
      <div className="more">
        {moreMunuList.map((item: any) => {
          return (
            <div
              id={`left-menu-${item.id}`}
              className={classnames('menu-item')}
              key={item.id}
              onMouseDown={() => {
                delSideMenu(item, 1, userId);
                clickActionWeblog(`menu_show_${item.id}`);
                bindMouseDown(item);
              }}
            >
              <div className="menu-item-icon">
                <XiuIcon type={item.icon} />
              </div>

              <div className="menu-item-name">{item.name}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default More;
