import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';

import { createUser, deleteUser, getUsers, User } from '../api';

const { Title } = Typography;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createUser(values);
      message.success('创建成功');
      setModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (err: any) {
      if (err?.errorFields) return; // 表单校验失败
      message.error(err?.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (err: any) {
      message.error(err?.message || '删除失败');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该用户吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!m-0">
          用户管理
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新增用户
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新增用户"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
