import Preview from '@/pages/Preview';
import AddPartModal from './AddPartModal';
import LoginModal from './LoginModal';
import LayerModal from './LayerModal';
import BackgroundReplace from './BackgroundReplace';
import QrCodeEditModal from './QrCodeEditModal';

export default function GlobalModal() {
  return (
    <>
      <AddPartModal />
      <LoginModal />
      <Preview />
      {/* 图层列表 */}
      <LayerModal />
      <BackgroundReplace />
      <QrCodeEditModal />
    </>
  );
}
