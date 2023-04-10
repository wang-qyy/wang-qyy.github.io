import { useState } from 'react';
import BeforeDownLoad from './BeforeDownLoad';
import VipWarning from './VipWarning';
import RechargeModule from './RechargeModule';
import DownloadProgress from './DownloadProgress';
import ShareModal from './ShareModal';
import DownloadModal from './DownloadModal';
import TeamCount from './TeamCount';
import InviteMembersModal from './InviteMembersModal';
import ShareDropdown from './ShareDropdown';

const DownLoadPopover = () => {
  const [platform, setPlatform] = useState('');

  return (
    <>
      <VipWarning />
      <RechargeModule />

      <DownloadProgress />

      <BeforeDownLoad />

      <ShareModal />

      <DownloadModal platform={platform} />
      <TeamCount />
      <InviteMembersModal />
      <ShareDropdown setPlatform={setPlatform} />
    </>
  );
};

export default DownLoadPopover;
