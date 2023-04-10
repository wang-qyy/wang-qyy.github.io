import { Button, message } from 'antd';
import {
  useInviteMembersModal,
  useTeamCountModal,
} from '@/store/adapter/useGlobalStatus';
import { getInviteLink } from '@/api/pub';
import { dataTeam } from '@/utils/webLog';
import styles from './index.modules.less';

export default function Content(props: any) {
  const { type, close } = props;
  const { open } = useInviteMembersModal();
  const { teamId } = useTeamCountModal();
  const showType = type === 'memberLess';
  const bindInviteLink = () => {
    getInviteLink().then(res => {
      if (res?.code === 0) {
        dataTeam({ team_id: teamId, action_type: 'dlSetInviteReg' });
        message.success('邀请链接复制成功');
        navigator.clipboard.writeText(res?.data?.url);
        close();
      } else {
        message.error(res?.msg);
      }
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        {showType ? '当前团队状态无下载机会' : '团队状态下载机会已用完'}
      </div>
      <div className={styles.desc}>
        {showType
          ? '邀请2名好友加入团队，即可获得5次下载机会'
          : '邀请好友加入团队或注册即可获得1次下载机会'}
      </div>
      <div className={styles.buttonWarp}>
        {showType ? null : (
          <Button className={styles.buttonLeft} onClick={bindInviteLink}>
            邀请好友注册
          </Button>
        )}

        <Button
          className={styles.buttonRight}
          type="primary"
          onClick={() => {
            showType
              ? dataTeam({ team_id: teamId, action_type: 'memberLessInvite' })
              : dataTeam({ team_id: teamId, action_type: 'dlSetInviteJoin' });
            open();
          }}
        >
          {showType ? '邀请成员加入团队' : '邀请好友加入团队'}
        </Button>
      </div>
    </div>
  );
}
