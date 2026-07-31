import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Carousel from './pages/Carousel';
import Home from './pages/Home';
import Menus from './pages/Menus';
import Templates from './pages/Templates';
import Upload from './pages/Upload';
import UploadRules from './pages/UploadRules';
import Users from './pages/Users';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<Users />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/upload-rules" element={<UploadRules />} />
            <Route path="/menus" element={<Menus />} />
            <Route path="/carousel" element={<Carousel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
