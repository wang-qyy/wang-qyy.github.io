import DownloadPolling from './DownloadPolling';
import Login from './Login';
import DownloadLimit from './DownloadLimit';
import Images from './Image';

export default function GlobalModal() {
  return (
    <>
      <DownloadPolling />
      <Login />
      <DownloadLimit />
      <Images />
    </>
  );
}
