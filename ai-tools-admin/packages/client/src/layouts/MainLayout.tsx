import {
  ApiOutlined,
  AppstoreOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  HomeOutlined,
  MenuOutlined,
  PictureOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: '用户管理',
  },
  {
    key: '/upload',
    icon: <CloudUploadOutlined />,
    label: '文件上传',
  },
  {
    key: '/templates',
    icon: <AppstoreOutlined />,
    label: '模版管理',
  },
  {
    key: '/upload-rules',
    icon: <FileTextOutlined />,
    label: '上传规则管理',
  },
  {
    key: '/menus',
    icon: <MenuOutlined />,
    label: '菜单管理',
  },
  {
    key: '/carousel',
    icon: <PictureOutlined />,
    label: '轮播图管理',
  },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className="min-h-screen">
      <Sider breakpoint="lg" collapsedWidth="0" className="bg-white">
        <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-gray-100 gap-2">
          <ApiOutlined className="text-[#1677ff]" />
          90设计-ai电商
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Content className="m-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
