import { CheckCircleOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { getHealth } from '../api';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const [status, setStatus] = useState<string>('检测中...');
  const [uptime, setUptime] = useState<number>(0);

  useEffect(() => {
    getHealth()
      .then((res) => {
        setStatus(res.status);
        setUptime(res.uptime);
      })
      .catch(() => {
        setStatus('服务未启动');
      });
  }, []);

  return (
    <div>
      <Title level={3} className="mb-6">
        系统概览
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="服务状态"
              value={status === 'ok' ? '运行中' : status}
              valueStyle={{
                color: status === 'ok' ? '#52c41a' : '#ff4d4f',
              }}
              prefix={status === 'ok' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="运行时间"
              value={uptime}
              suffix="秒"
              precision={0}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="API 地址"
              value="localhost:3000"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="技术栈" className="mt-6">
        <Space wrap size={[8, 8]}>
          <Tag color="blue">Koa</Tag>
          <Tag color="cyan">TypeScript</Tag>
          <Tag color="geekblue">React 18</Tag>
          <Tag color="purple">Ant Design 5</Tag>
          <Tag color="orange">Vite</Tag>
          <Tag color="green">pnpm Workspace</Tag>
        </Space>

        <Paragraph className="mt-4 text-gray-500">
          这是一个基于 pnpm workspace 的全栈项目模板。服务端使用 Koa + TypeScript 提供 RESTful
          API，前端使用 React 18 + Ant Design 5 构建可视化界面，通过 Vite
          开发服务器代理解决跨域问题。
        </Paragraph>
      </Card>
    </div>
  );
};

export default Home;
