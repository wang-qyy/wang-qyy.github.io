import moment from 'moment';
import { userSaveTime } from '@/store/adapter/useGlobalStatus';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';

export const getSaveStatusOption = (status: number) => {
  const time = userSaveTime();
  switch (status) {
    case 0:
      return {
        text: '保存',
        iconType: 'iconweibaocun',
        tooltip: (
          <div style={{ padding: 6 }}>
            <p style={{ fontSize: 14, marginBottom: 6 }}>
              所有编辑都会自动保存！
            </p>
            <p style={{ marginBottom: 0 }}>
              快捷键{KEY_PRESS_Tooltip.save}，或手动点击保存
            </p>
          </div>
        ),
      };
    case 1:
      return {
        text: '保存中',
        iconType: 'iconbaocunzhong',
      };
    case 2:
      return {
        text: `${moment(time).format('HH:mm')} 已保存`,
        iconType: 'iconbaocunchenggong',
        tooltip: (
          <div style={{ padding: 6 }}>
            <p style={{ fontSize: 14, marginBottom: 6 }}>
              所有编辑都已自动保存！
            </p>
            <p style={{ marginBottom: 0 }}>
              快捷键{KEY_PRESS_Tooltip.save}，或手动点击保存
            </p>
          </div>
        ),
      };
    case 3:
      return {
        text: '已自动为您保存',
      };
    case 4:
      return {
        text: '更改未保存',
        iconType: 'iconbaocunshibai1',
        tooltip: '要保存您的设计,需要登录或注册',
      };
    case 6: //
    case 5:
      return {
        text: '保存失败',
        iconType: 'iconbaocunshibai1',
        tooltip: `最近一次修改保存于${moment(time).format('HH:mm')}`,
      };
    default:
      return {
        text: '保存',
        iconType: 'iconweibaocun',
        tooltip: '所有编辑都会自动保存！',
      };
  }
};
