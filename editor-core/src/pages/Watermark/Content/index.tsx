import LoginModal from '@/pages/GlobalMobal/LoginModal';

import BottomBar from './BottomBar';
import Aside from './Aside';
import Canvas from './Canvas';
import './index.less';

export default function Content() {
  return (
    <div className="xiudodo-tools-main">
      <LoginModal />
      <div className="xiudodo-tools-aside">
        <Aside />
      </div>

      <div className="xiudodo-tools-content">
        <Canvas />
        <div className="xiudodo-bottomBar">
          <BottomBar />
        </div>
      </div>
    </div>
  );
}
