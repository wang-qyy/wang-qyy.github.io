import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MenuOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CATEGORY_OPTIONS,
  getMenus,
  MenuGroup,
  MenuItem,
  saveMenus,
  TEMPLATE_CATEGORIES,
  toggleMenuItemStatus,
  uploadSingle,
} from '../api';

// ==================== 新版用 uploadSingle 单文件上传获取 URL ====================
async function uploadPreview(file: File): Promise<string> {
  const res = await uploadSingle(file);
  return res.data.url;
}

const { Text, Title } = Typography;

const Menus: React.FC = () => {
  // ==================== 状态 ====================
  const [groups, setGroups] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [form] = Form.useForm();

  // 编辑上下文
  type EditTarget =
    | { mode: 'addGroup' }
    | { mode: 'editGroup'; groupId: string }
    | { mode: 'addItem'; groupId: string }
    | { mode: 'editItem'; groupId: string; itemId: string };
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  // preview 上传
  const [previewUploading, setPreviewUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // ==================== 加载数据 ====================
  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMenus();
      setGroups(res.data);
    } catch {
      message.error('加载菜单失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // ==================== 保存全部 ====================
  const handleSaveAll = useCallback(async () => {
    setSaving(true);
    try {
      await saveMenus(groups);
      message.success('已保存');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  }, [groups]);

  // ==================== 弹窗 ====================
  const openModal = useCallback(
    (target: EditTarget, initialValues?: Record<string, string>) => {
      setEditTarget(target);
      if (target.mode === 'addGroup') {
        setModalTitle('新增菜单分组');
      } else if (target.mode === 'editGroup') {
        setModalTitle('编辑分组名称');
      } else if (target.mode === 'addItem') {
        setModalTitle('新增菜单项');
      } else {
        setModalTitle('编辑菜单项');
      }
      setPreviewUrl('');
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setPreviewUrl(initialValues.preview || '');
      }
      setModalOpen(true);
    },
    [form],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditTarget(null);
    setPreviewUrl('');
    form.resetFields();
  }, [form]);

  // preview 文件上传（beforeUpload 直接拿到 RcFile，无需通过 originFileObj）
  const handlePreviewBeforeUpload = useCallback(
    (file: RcFile) => {
      setPreviewUploading(true);
      uploadPreview(file as unknown as File)
        .then((url) => {
          setPreviewUrl(url);
          form.setFieldsValue({ preview: url });
          message.success('预览图上传成功');
        })
        .catch(() => message.error('上传预览图失败'))
        .finally(() => setPreviewUploading(false));
      return false;
    },
    [form],
  );

  // 提交弹窗
  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (!editTarget) return;

      const newGroups = structuredClone(groups);

      if (editTarget.mode === 'addGroup') {
        const newId = String(
          Math.max(
            0,
            ...newGroups.flatMap((g) => [Number(g.id), ...g.children.map((c) => Number(c.id))]),
          ) + 1,
        );
        newGroups.push({
          id: newId,
          name: values.name,
          children: [],
        });
      } else if (editTarget.mode === 'editGroup') {
        const g = newGroups.find((g) => g.id === editTarget.groupId);
        if (g) g.name = values.name;
      } else if (editTarget.mode === 'addItem') {
        const g = newGroups.find((g) => g.id === editTarget.groupId);
        if (g) {
          const newId = String(
            Math.max(
              0,
              ...newGroups.flatMap((gr) => [
                Number(gr.id),
                ...gr.children.map((c) => Number(c.id)),
              ]),
            ) + 1,
          );
          g.children.push({
            id: newId,
            name: values.name,
            icon: values.icon || '',
            url: values.url || '',
            preview: previewUrl,
            desc: values.desc || '',
            type: values.type || '',
          });
        }
      } else if (editTarget.mode === 'editItem') {
        for (const g of newGroups) {
          const idx = g.children.findIndex(
            (c) => g.id === editTarget.groupId && c.id === editTarget.itemId,
          );
          if (idx !== -1) {
            g.children[idx] = {
              ...g.children[idx],
              name: values.name,
              icon: values.icon || '',
              url: values.url || '',
              preview: previewUrl,
              desc: values.desc || '',
              type: values.type || '',
            };
            break;
          }
        }
      }

      setGroups(newGroups);
      closeModal();
    } catch {
      // 表单校验失败
    }
  }, [editTarget, form, groups, closeModal, previewUrl]);

  // ==================== 删除 ====================
  const handleDeleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const handleDeleteItem = useCallback((groupId: string, itemId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, children: g.children.filter((c) => c.id !== itemId) } : g,
      ),
    );
  }, []);

  // ==================== 上下线切换 ====================
  const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());

  const handleToggleStatus = useCallback(
    async (groupId: string, itemId: string, checked: boolean) => {
      const key = `${groupId}-${itemId}`;
      const newStatus = checked ? 'online' : 'offline';

      // 乐观更新
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                children: g.children.map((c) =>
                  c.id === itemId ? { ...c, status: newStatus } : c,
                ),
              }
            : g,
        ),
      );
      setTogglingKeys((prev) => new Set(prev).add(key));

      try {
        await toggleMenuItemStatus(groupId, itemId, newStatus);
        message.success(newStatus === 'online' ? '已上线' : '已下线');
      } catch {
        // 回滚
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  children: g.children.map((c) =>
                    c.id === itemId ? { ...c, status: checked ? 'offline' : 'online' } : c,
                  ),
                }
              : g,
          ),
        );
        message.error('切换失败');
      } finally {
        setTogglingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [],
  );

  // ==================== 筛选 ====================
  const filteredGroups = useMemo(() => {
    if (filterStatus === 'all') return groups;
    return groups
      .map((g) => ({
        ...g,
        children: g.children.filter((item) =>
          filterStatus === 'online' ? item.status !== 'offline' : item.status === 'offline',
        ),
      }))
      .filter((g) => g.children.length > 0);
  }, [groups, filterStatus]);

  // ==================== 渲染 ======================
  const renderItem = (group: MenuGroup, item: MenuItem) => {
    const isOnline = item.status !== 'offline';
    const toggleKey = `${group.id}-${item.id}`;
    const isToggling = togglingKeys.has(toggleKey);

    return (
      <Card
        key={`${group.id}-${item.id}`}
        size="small"
        className="mb-2"
        type="inner"
        title={
          <Space>
            {item.name}
            <Tag color="blue">{TEMPLATE_CATEGORIES[item.type] || item.type || '未设置'}</Tag>
            <Tag color={isOnline ? 'green' : 'red'}>{isOnline ? '已上线' : '已下线'}</Tag>
            <Text type="secondary" className="text-xs">
              ID: {item.id}
            </Text>
          </Space>
        }
        extra={
          <Space size="small">
            <Switch
              checked={isOnline}
              loading={isToggling}
              checkedChildren="上线"
              unCheckedChildren="下线"
              onChange={(checked) => handleToggleStatus(group.id, item.id, checked)}
            />
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                openModal(
                  { mode: 'editItem', groupId: group.id, itemId: item.id },
                  {
                    name: item.name,
                    icon: item.icon,
                    url: item.url,
                    desc: item.desc,
                    type: item.type,
                    preview: item.preview,
                  },
                )
              }
            >
              编辑
            </Button>
            <Popconfirm title="确定删除？" onConfirm={() => handleDeleteItem(group.id, item.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <div className="flex gap-3">
          {item.preview && (
            <Image
              src={item.preview}
              width={60}
              height={60}
              className="object-cover rounded border shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            {item.desc && (
              <div className="mb-1">
                <Text className="text-xs" type="secondary">
                  描述：
                </Text>
                <Text className="text-xs">{item.desc}</Text>
              </div>
            )}
            <div>
              <Text className="text-xs" type="secondary">
                链接：
              </Text>
              <Text className="text-xs" code>
                {item.url}
              </Text>
            </div>
            {item.icon && (
              <div>
                <Text className="text-xs" type="secondary">
                  图标：
                </Text>
                <Text className="text-xs" code>
                  {item.icon}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="mb-0">
          <MenuOutlined className="mr-2" />
          菜单管理
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal({ mode: 'addGroup' })}
          >
            新增分组
          </Button>
          <Button type="primary" ghost onClick={handleSaveAll} loading={saving}>
            保存全部
          </Button>
        </Space>
      </div>

      {/* 状态筛选 */}
      <div className="mb-4">
        <Radio.Group
          value={filterStatus}
          optionType="button"
          buttonStyle="solid"
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="online">已上线</Radio.Button>
          <Radio.Button value="offline">已下线</Radio.Button>
        </Radio.Group>
        {filterStatus !== 'all' && (
          <Text type="secondary" className="ml-3">
            筛选到 {filteredGroups.reduce((s, g) => s + g.children.length, 0)} 项
          </Text>
        )}
      </div>

      {/* 菜单列表 */}
      <Spin spinning={loading}>
        {filteredGroups.length === 0 && !loading ? (
          <Card>
            <Text type="secondary">暂无菜单数据，点击"新增分组"开始</Text>
          </Card>
        ) : (
          <Collapse
            size="small"
            activeKey={filteredGroups.map((g) => g.id)}
            items={filteredGroups.map((group) => ({
              key: group.id,
              label: (
                <div className="flex justify-between items-center pr-4">
                  <Space>
                    <Text strong>{group.name}</Text>
                    <Tag>{group.children.length} 项</Tag>
                    <Text type="secondary" className="text-xs">
                      ID: {group.id}
                    </Text>
                  </Space>
                </div>
              ),
              extra: (
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() =>
                      openModal({ mode: 'editGroup', groupId: group.id }, { name: group.name })
                    }
                  >
                    重命名
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => openModal({ mode: 'addItem', groupId: group.id })}
                  >
                    添加项
                  </Button>
                  <Popconfirm
                    title="确定删除该分组及其所有子项？"
                    onConfirm={() => handleDeleteGroup(group.id)}
                  >
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
              children: (
                <Row gutter={16}>
                  {group.children.length === 0 ? (
                    <Text type="secondary" className="text-xs">
                      暂无子项，点击"添加项"新增
                    </Text>
                  ) : (
                    group.children.map((item) => (
                      <Col span={12} key={item.id}>
                        {renderItem(group, item)}
                      </Col>
                    ))
                  )}
                </Row>
              ),
            }))}
          />
        )}
      </Spin>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={modalTitle}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={closeModal}
        destroyOnHidden
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          {/* 通用：名称 */}
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="菜单名称" />
          </Form.Item>

          {/* 分组只有名称，子项有更多字段 */}
          {editTarget && (editTarget.mode === 'addItem' || editTarget.mode === 'editItem') && (
            <>
              <Form.Item name="desc" label="描述">
                <Input.TextArea rows={2} placeholder="功能描述" />
              </Form.Item>

              <Form.Item
                name="type"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="选择 TEMPLATE_CATEGORIES 分类" options={CATEGORY_OPTIONS} />
              </Form.Item>

              <Form.Item name="url" label="链接 URL">
                <Input placeholder="/workspace/ai-image/xxx.html" />
              </Form.Item>

              <Form.Item name="icon" label="图标 class">
                <Input placeholder="tw:icon-[solar--star-broken]" />
              </Form.Item>

              <Form.Item label="预览图">
                <Upload.Dragger
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={handlePreviewBeforeUpload}
                  disabled={previewUploading}
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      width={120}
                      height={80}
                      className="object-cover rounded"
                      preview={false}
                    />
                  ) : (
                    <>
                      <p className="text-2xl text-gray-400">
                        <InboxOutlined />
                      </p>
                      <p className="text-gray-500">点击或拖拽上传预览图</p>
                    </>
                  )}
                  {previewUploading && <p className="text-blue-500 mt-1">上传中...</p>}
                </Upload.Dragger>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Menus;
