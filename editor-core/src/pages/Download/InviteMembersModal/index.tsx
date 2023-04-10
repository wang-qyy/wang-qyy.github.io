import React, { useEffect, useState } from 'react';
import { message, Input } from 'antd';
import {
  useInviteMembersModal,
  useTeamCountModal,
} from '@/store/adapter/useGlobalStatus';
import { getTeamCreateInviteLink } from '@/api/pub';
import NoTitleModal from '@/components/NoTitleModal';
import styles from './index.less';
import { dataTeam } from '@/utils/webLog';

const { TextArea } = Input;

const InviteMembersModal = () => {
  const { value, close } = useInviteMembersModal();
  const [teamCreateInviteLink, setTeamCreateInviteLink] = useState(null);
  const { close: teamCountModalClose,teamId } = useTeamCountModal();

  const run = () => {
    getTeamCreateInviteLink().then(res => {
      if (res?.code === 0) {
        setTeamCreateInviteLink(res?.data);
      } else {
        message.error(res?.msg);
      }
    });
  };
  useEffect(() => {
    if (value) {
      teamCountModalClose();
      run();
    }
  }, [value]);

  const copy = () => {
    dataTeam({ team_id: teamId, action_type: 'copyInviteLink' })
    const Url2 = document.getElementById('biao1');
    Url2?.select(); // 选择对象
    document.execCommand('Copy'); // 执行浏览器复制命令
  };

  return (
    <NoTitleModal visible={value} width={427} onCancel={close} footer={null}>
      <div className={styles.inviteMembersModal}>
        <div className={styles.inviteMembersModalTop}>邀请成员</div>
        <TextArea
          bordered={false}
          rows={4}
          className={styles.inviteMembersModalContent}
          id="biao1"
          value={`${teamCreateInviteLink?.username} 邀请你加入秀多多项目—${teamCreateInviteLink?.teamName} 点击链接加入:${teamCreateInviteLink?.url}`}
        />
        <div className={styles.inviteMembersModalFooter} onClick={() => copy()}>
          复制链接
        </div>
      </div>
    </NoTitleModal>
  );
};

export default InviteMembersModal;
