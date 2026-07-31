import {
  AppstoreOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  InboxOutlined,
  OrderedListOutlined,
  PictureOutlined,
  PlusOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';

import type { Template, TemplateImage } from '../api';
import {
  addHomeTemp,
  createTemplate,
  deleteTemplate,
  getHomeTempIds,
  getMenus,
  getTemplates,
  removeHomeTemp,
  TEMPLATE_CATEGORIES,
  updateTemplate,
  uploadBatch,
} from '../api';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// ==================== 类型定义 ====================

/** 表单中跟踪的上传图片条目 */
interface ImageEntry {
  key: string; // 唯一标识
  url: string;
  imgType: number;
  /** 是否为已有图片（编辑时从模版加载的，不需要再上传） */
  existing: boolean;
  /** 是否为预览图 */
  isPreview: boolean;
}

// ==================== 常量 ====================

const IMG_TYPE_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '原图', color: 'blue' },
  1: { label: '参考图', color: 'green' },
  2: { label: '模特图', color: 'orange' },
  '-1': { label: '预览图', color: 'default' },
};

const IMG_TYPE_OPTIONS = [
  { value: 0, label: '搭配图' },
  { value: 1, label: '参考图' },
  { value: 2, label: '模特图' },
];

/** 每种图片类型的数量上限 */
const MAX_BY_TYPE: Record<number, number> = {
  0: 8, // 搭配图
  1: 1, // 参考图
  2: 1, // 模特图
};

let entryCounter = 0;
function nextEntryKey(): string {
  entryCounter += 1;
  return `img_${Date.now()}_${entryCounter}`;
}

// ==================== 组件 ====================

function RenderImage({ url, color, label }: { url: string; color: string; label: string }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
      <Image src={url} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 6 }} />
      <Tag
        color={color}
        className="absolute bottom-0.5 left-0.5"
        style={{ fontSize: 10, lineHeight: '14px', margin: 0 }}
      >
        {label}
      </Tag>
    </div>
  );
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | undefined>('');
  const [filterHomeOnly, setFilterHomeOnly] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [homeTempIds, setHomeTempIds] = useState<Set<number>>(new Set());
  const [homeTempLoading, setHomeTempLoading] = useState<Record<number, boolean>>({});
  const [form] = Form.useForm();

  // ==================== 数据加载 ====================

  // 从 menus 中提取 type 作为分类选项
  useEffect(() => {
    getMenus()
      .then((res) => {
        const groups = res.data ?? [];
        const seen = new Set<string>();
        const options: { value: string; label: string }[] = [];
        for (const g of groups) {
          for (const item of g.children ?? []) {
            if (item.type && !seen.has(item.type)) {
              seen.add(item.type);
              options.push({
                value: item.type,
                label: TEMPLATE_CATEGORIES[item.type] ?? item.type,
              });
            }
          }
        }
        setCategoryOptions(options);
      })
      .catch(() => {
        // 加载失败不回退，保持空列表
      });
  }, []);

  const loadTemplates = async (category?: string) => {
    setLoading(true);
    try {
      const result = await getTemplates(category);
      setTemplates(result.data ?? []);
    } catch (err: any) {
      message.error(err.message || '加载模版列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates(filterCategory);
  }, [filterCategory]);

  // 加载首页展示模板 ID 列表
  const loadHomeTemps = async () => {
    try {
      const res = await getHomeTempIds();
      setHomeTempIds(new Set(res.data ?? []));
    } catch {
      // 静默失败
    }
  };

  useEffect(() => {
    loadHomeTemps();
  }, []);

  // 切换首页展示状态（传入完整模板数据）
  const handleToggleHomeTemp = async (template: Template) => {
    const tid = template.id;
    const isHome = homeTempIds.has(tid);

    setHomeTempLoading((prev) => ({ ...prev, [tid]: true }));
    try {
      if (isHome) {
        await removeHomeTemp(tid);
        setHomeTempIds((prev) => {
          const next = new Set(prev);
          next.delete(tid);
          return next;
        });
        message.success('已取消首页展示');
      } else {
        // 发送完整模板数据，结构对齐 /data/templates/{category}.json
        await addHomeTemp({
          id: template.id,
          category: template.category,
          preview: template.preview,
          params: template.params,
          showInHome: true,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        });
        setHomeTempIds((prev) => new Set(prev).add(tid));
        message.success('已设为首页展示');
      }
    } catch (err: any) {
      message.error(err.message || '操作失败');
    } finally {
      setHomeTempLoading((prev) => ({ ...prev, [tid]: false }));
    }
  };

  // 素材图片上传相关状态
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);

  // ==================== 查看详情 ====================

  const handleViewDetail = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setDrawerOpen(true);
  };

  // ==================== 新增 / 编辑 ====================

  const handleAdd = () => {
    setEditingTemplate(null);
    setImageEntries([]);
    setUploadFileList([]);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (tpl: Template) => {
    setEditingTemplate(tpl);
    setUploadFileList([]);
    form.setFieldsValue({
      category: tpl.category,
      prompt: tpl.params.prompt,
    });
    // 将已有图片转为 ImageEntry
    const entries: ImageEntry[] = tpl.params.taskConfig.images.map((img) => ({
      key: nextEntryKey(),
      url: img.url,
      imgType: img.imgType,
      existing: true,
      isPreview: img.url === tpl.preview,
    }));
    // 如果预览图不在 taskConfig.images 中，作为独立条目加入
    const hasPreviewInImages = entries.some((e) => e.isPreview);
    if (!hasPreviewInImages && tpl.preview) {
      entries.push({
        key: nextEntryKey(),
        url: tpl.preview,
        imgType: 0, // 默认搭配图
        existing: true,
        isPreview: true,
      });
    }
    setImageEntries(entries);
    setModalOpen(true);
  };

  // ==================== 图片条目操作 ====================

  /** 设置某张图为预览图（同时取消其他图的预览标记） */
  const handleSetPreview = (key: string) => {
    setImageEntries((prev) =>
      prev.map((e) => ({ ...e, isPreview: e.key === key ? !e.isPreview : false })),
    );
  };

  // ==================== 素材图片上传 ====================

  const handleFilesSelected = async (fileList: UploadFile[]) => {
    const files = fileList
      .filter((f) => f.originFileObj instanceof File)
      .map((f) => f.originFileObj as File);

    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadBatch(files);
      setUploadProgress(100);

      const newEntries: ImageEntry[] = result.data.success.map((r) => ({
        key: nextEntryKey(),
        url: r.url,
        imgType: 0, // 默认搭配图
        existing: false,
        isPreview: false,
      }));

      setImageEntries((prev) => {
        const existingType0 = prev.filter((e) => e.imgType === 0).length;
        const remaining = MAX_BY_TYPE[0] - existingType0;
        if (newEntries.length > remaining) {
          message.warning(
            `搭配图已达上限（${MAX_BY_TYPE[0]} 张），仅添加了前 ${remaining} 张，其余 ${newEntries.length - remaining} 张请手动调整类型`,
          );
          return [...prev, ...newEntries.slice(0, remaining)];
        }
        if (remaining === 0) {
          message.warning(`搭配图已达上限（${MAX_BY_TYPE[0]} 张），请手动调整已有图片的类型`);
        }
        return [...prev, ...newEntries];
      });

      const failedCount = result.data.failed.length;
      if (newEntries.length > 0) {
        message.success(
          `成功上传 ${newEntries.length} 个文件${failedCount > 0 ? `，${failedCount} 个失败` : ''}`,
        );
      }
      if (failedCount > 0) {
        result.data.failed.forEach((f) => {
          message.error(`${f.originalName}: ${f.error}`);
        });
      }
    } catch (err: any) {
      message.error(err.message || '上传失败');
    } finally {
      setUploading(false);
      setUploadFileList([]);
    }
  };

  // ==================== 图片条目操作 ====================

  const handleImageTypeChange = (key: string, newType: number) => {
    setImageEntries((prev) => {
      const entry = prev.find((e) => e.key === key);
      if (!entry) return prev;
      // 统计当前类型数量（排除即将改变的这张）
      const countForType = (type: number) =>
        prev.filter((e) => e.key !== key && e.imgType === type).length;
      const currentSameType = countForType(newType);
      const max = MAX_BY_TYPE[newType] ?? Infinity;
      if (currentSameType >= max) {
        const name = IMG_TYPE_MAP[newType]?.label ?? '未知';
        message.warning(`${name}最多 ${max} 张，无法继续添加`);
        return prev;
      }
      return prev.map((e) => (e.key === key ? { ...e, imgType: newType } : e));
    });
  };

  const handleRemoveImage = (key: string) => {
    setImageEntries((prev) => prev.filter((e) => e.key !== key));
  };

  // ==================== 保存 ====================

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // 检查是否指定了预览图
      const previewEntry = imageEntries.find((e) => e.isPreview);
      if (!previewEntry) {
        message.error('请至少指定一张预览图');
        return;
      }

      // 检查是否至少有一张搭配图
      const hasCombination = imageEntries.some((e) => e.imgType === 0);
      if (!hasCombination) {
        message.error('请至少配置一张搭配图');
        return;
      }

      // 校验各类型数量不超限
      const typeCount: Record<number, number> = {};
      for (const entry of imageEntries) {
        typeCount[entry.imgType] = (typeCount[entry.imgType] ?? 0) + 1;
      }
      for (const [type, count] of Object.entries(typeCount)) {
        const t = Number(type);
        const max = MAX_BY_TYPE[t];
        if (max != null && count > max) {
          message.error(
            `${IMG_TYPE_MAP[t]?.label ?? '未知类型'}最多 ${max} 张，当前为 ${count} 张`,
          );
          return;
        }
      }

      const images: TemplateImage[] = imageEntries.map((e) => ({
        url: e.url,
        imgType: e.imgType,
      }));

      const payload = {
        category: values.category,
        preview: previewEntry.url,
        params: { prompt: values.prompt, taskConfig: { images } },
      };

      setModalLoading(true);
      try {
        if (editingTemplate) {
          await updateTemplate(editingTemplate.id, payload);
          message.success('模版已更新');
        } else {
          await createTemplate(payload);
          message.success('模版已创建');
        }
        setModalOpen(false);
        setImageEntries([]);
        setUploadFileList([]);
        form.resetFields();
        // 重新加载列表
        loadTemplates(filterCategory);
      } catch (err: any) {
        message.error(err.message || '保存失败');
      } finally {
        setModalLoading(false);
      }
    } catch {
      // validateFields 失败
    }
  };

  // ==================== 删除 ====================

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id);
      message.success('模版已删除');
      loadTemplates(filterCategory);
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  // 前端筛选：首页展示
  const displayTemplates = filterHomeOnly
    ? templates.filter((tpl) => homeTempIds.has(tpl.id))
    : templates;

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <Title level={4} className="!m-0">
          模版管理
        </Title>
        <Space wrap>
          <Select
            allowClear
            placeholder="按分类筛选"
            className="!w-[180px]"
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
            options={[{ value: '', label: '全部' }, ...categoryOptions]}
          />
          <Tooltip title={filterHomeOnly ? '显示全部' : '仅看首页展示'}>
            <Button
              icon={<HomeOutlined />}
              type={filterHomeOnly ? 'primary' : 'default'}
              onClick={() => setFilterHomeOnly((v) => !v)}
            />
          </Tooltip>
          <Space.Compact>
            <Tooltip title="网格视图">
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
            </Tooltip>
            <Tooltip title="列表视图">
              <Button
                icon={<OrderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
            </Tooltip>
          </Space.Compact>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增模版
          </Button>
        </Space>
      </div>

      {/* 模版列表 */}
      {displayTemplates.length === 0 ? (
        <Empty description={loading ? '加载中...' : '暂无模版，点击右上角新增'} className="mt-20" />
      ) : viewMode === 'grid' ? (
        <Row gutter={[16, 16]}>
          {displayTemplates.map((tpl) => {
            const images = tpl.params.taskConfig?.images || [];
            return (
              <Col key={`${tpl.category}-${tpl.id}`} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  size="small"
                  className="h-full flex flex-col"
                  styles={{
                    body: { padding: 12, flex: 1, display: 'flex', flexDirection: 'column' },
                  }}
                >
                  {/* 头部：分类标签 + ID */}
                  <div className="flex items-center justify-between mb-2">
                    <Tag color="purple">{TEMPLATE_CATEGORIES[tpl.category] ?? tpl.category}</Tag>
                    <Text type="secondary" className="text-xs">
                      ID: {tpl.id}
                    </Text>
                  </div>

                  {/* 图片预览行 */}
                  <div className="flex-1">
                    {!!tpl.preview && images.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 mb-2">
                        {[{ url: tpl.preview, imgType: -1 }, ...images].map((img, idx) => {
                          const typeInfo = IMG_TYPE_MAP[img.imgType] ?? {
                            label: '未知',
                            color: 'default',
                          };
                          return <RenderImage key={idx} url={img.url} {...typeInfo} />;
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                        <Text type="secondary" className="text-xs">
                          暂无图片
                        </Text>
                      </div>
                    )}

                    {/* Prompt 描述 */}
                    <Paragraph
                      ellipsis={{ rows: 2, tooltip: tpl.params.prompt }}
                      className="mb-2 text-xs"
                    >
                      <Text className="text-xs">{tpl.params.prompt}</Text>
                    </Paragraph>
                  </div>

                  {/* 底部信息栏 */}
                  <div className="border-t pt-2 mt-auto">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text type="secondary" className="text-xs">
                          {tpl.createdAt || ''}
                        </Text>
                      </Col>
                    </Row>

                    {/* 操作按钮 */}
                    <div className="flex justify-end gap-1 mt-2">
                      <Tooltip title={homeTempIds.has(tpl.id) ? '取消首页展示' : '设为首页展示'}>
                        <Button
                          type="text"
                          size="small"
                          icon={<HomeOutlined />}
                          loading={!!homeTempLoading[tpl.id]}
                          onClick={() => handleToggleHomeTemp(tpl)}
                          style={{
                            color: homeTempIds.has(tpl.id) ? '#1677ff' : undefined,
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="查看详情">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetail(tpl)}
                        />
                      </Tooltip>
                      <Tooltip title="编辑">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(tpl)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="确定要删除这个模版吗？"
                        onConfirm={() => handleDelete(tpl.id)}
                        okText="删除"
                        cancelText="取消"
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <div className="flex flex-col gap-3">
          {displayTemplates.map((tpl) => {
            const images = tpl.params.taskConfig?.images || [];
            return (
              <Card key={tpl.id} hoverable size="small" styles={{ body: { padding: 12 } }}>
                {/* 头部 */}
                <div className="flex items-center justify-between mb-2">
                  <Tag color="purple">{TEMPLATE_CATEGORIES[tpl.category] ?? tpl.category}</Tag>
                  <Text type="secondary" className="text-xs">
                    ID: {tpl.id}
                  </Text>
                </div>

                {/* 图片预览 + 描述 */}
                <div className="flex gap-3">
                  {/* 图片预览行 */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
                    {images.length > 0 ? (
                      <>
                        {images.map((img, idx) => {
                          const typeInfo = IMG_TYPE_MAP[img.imgType] ?? {
                            label: '未知',
                            color: 'default',
                          };
                          return (
                            <div
                              key={idx}
                              className="relative flex-shrink-0"
                              style={{ width: 72, height: 72 }}
                            >
                              <Image
                                src={img.url}
                                width={72}
                                height={72}
                                style={{ objectFit: 'cover', borderRadius: 6 }}
                              />
                              <Tag
                                color={typeInfo.color}
                                className="absolute bottom-0.5 left-0.5"
                                style={{ fontSize: 10, lineHeight: '14px', margin: 0 }}
                              >
                                {typeInfo.label}
                              </Tag>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div
                        className="flex items-center justify-center bg-gray-100 rounded-md"
                        style={{ width: 72, height: 72 }}
                      >
                        <Text type="secondary" className="text-xs">
                          暂无图片
                        </Text>
                      </div>
                    )}
                  </div>

                  {/* Prompt */}
                  <div className="flex-1 min-w-0">
                    <Paragraph
                      ellipsis={{ rows: 2, tooltip: tpl.params.prompt }}
                      className="mb-1 text-xs"
                    >
                      <Text className="text-xs">{tpl.params.prompt}</Text>
                    </Paragraph>
                  </div>
                </div>

                {/* 底部 */}
                <div className="border-t pt-2 mt-2 flex items-center justify-between">
                  <Tag icon={<PictureOutlined />} color="blue" style={{ margin: 0 }}>
                    {images.length} 张
                  </Tag>
                  <div className="flex items-center gap-1">
                    <Text type="secondary" className="text-[11px] mr-2">
                      {tpl.createdAt || ''}
                    </Text>
                    <Tooltip title={homeTempIds.has(tpl.id) ? '取消首页展示' : '设为首页展示'}>
                      <Button
                        type="text"
                        size="small"
                        icon={<HomeOutlined />}
                        loading={!!homeTempLoading[tpl.id]}
                        onClick={() => handleToggleHomeTemp(tpl)}
                        style={{
                          color: homeTempIds.has(tpl.id) ? '#1677ff' : undefined,
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="查看详情">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(tpl)}
                      />
                    </Tooltip>
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(tpl)}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="确定要删除这个模版吗？"
                      onConfirm={() => handleDelete(tpl.id)}
                      okText="删除"
                      cancelText="取消"
                    >
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 详情抽屉 */}
      <Drawer
        title={`模版详情 #${selectedTemplate?.id ?? ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={680}
        extra={
          selectedTemplate && (
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  handleEdit(selectedTemplate);
                }}
              >
                编辑
              </Button>
            </Space>
          )
        }
      >
        {selectedTemplate && (
          <div>
            {/* 基本信息 */}
            <Row gutter={16} className="mb-5">
              <Col span={12}>
                <Text strong className="block mb-1">
                  模版分类
                </Text>
                <Tag color="purple">
                  {TEMPLATE_CATEGORIES[selectedTemplate.category] ?? selectedTemplate.category}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong className="block mb-1">
                  创建时间
                </Text>
                <Text>{selectedTemplate.createdAt || ''}</Text>
              </Col>
            </Row>

            {/* 预览图 */}
            <div className="mb-6">
              <Text strong className="block mb-2">
                预览图
              </Text>
              <Image
                src={selectedTemplate.preview}
                className="max-w-full rounded-lg"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNiZmJmYmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
              />
            </div>

            {/* Prompt 文本 */}
            <div className="mb-6">
              <Text strong className="block mb-2">
                prompt
              </Text>
              <div className="bg-[#f6f8fa] py-3 px-4 rounded-lg leading-[1.8] text-sm whitespace-pre-wrap">
                {selectedTemplate.params.prompt}
              </div>
            </div>

            {/* 素材图片列表 */}
            <div>
              <Text strong className="block mb-3">
                素材图片（{selectedTemplate.params.taskConfig.images.length} 张）
              </Text>
              <div className="flex flex-col gap-3">
                {selectedTemplate.params.taskConfig.images.map((img, idx) => {
                  const typeInfo = IMG_TYPE_MAP[img.imgType] ?? { label: '未知', color: 'default' };
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 px-3 bg-[#fafafa] rounded-lg border border-gray-100"
                    >
                      <Text type="secondary" className="w-7 text-center shrink-0">
                        {idx + 1}
                      </Text>
                      <Image
                        src={img.url}
                        width={64}
                        height={64}
                        className="object-cover rounded-md shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Paragraph copyable ellipsis className="mb-1 text-xs">
                          {img.url}
                        </Paragraph>
                        <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ==================== 新增 / 编辑弹窗 ==================== */}
      <Modal
        title={editingTemplate ? '编辑模版' : '新增模版'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setModalOpen(false);
          setImageEntries([]);
          setUploadFileList([]);
          form.resetFields();
        }}
        width={780}
        centered
        okText="保存"
        cancelText="取消"
        confirmLoading={modalLoading || uploading}
        destroyOnHidden
        styles={{ body: { height: '80vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          {/* 模版分类 */}
          <Form.Item
            name="category"
            label="模版分类"
            rules={[{ required: true, message: '请选择模版分类' }]}
          >
            <Select
              placeholder="请选择模版分类"
              options={categoryOptions}
              showSearch
              filterOption={(input, option) => (option?.label as string)?.includes(input)}
            />
          </Form.Item>

          <Form.Item
            name="prompt"
            label="prompt"
            rules={[{ required: true, message: '请输入提示词' }]}
          >
            <TextArea rows={4} placeholder="请输入 AI 生成提示词..." />
          </Form.Item>

          {/* 素材图片上传 */}
          <Form.Item
            label={
              <Space>
                <span>素材图片</span>
                <Tag>{imageEntries.length} 张</Tag>
              </Space>
            }
            required
            extra={
              <Space size={[8, 4]} wrap>
                <Tag color="blue">搭配图 ≤8</Tag>
                <Tag color="green">参考图 ≤1</Tag>
                <Tag color="orange">模特图 ≤1</Tag>
              </Space>
            }
          >
            <Dragger
              multiple
              accept="image/*"
              showUploadList={false}
              disabled={uploading}
              fileList={uploadFileList}
              beforeUpload={() => false}
              onChange={(info) => {
                setUploadFileList(info.fileList);
                const pending = info.fileList.filter((f) => f.originFileObj instanceof File);
                if (pending.length > 0) {
                  handleFilesSelected(info.fileList);
                }
              }}
              className="mb-4"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">支持批量选择</p>
            </Dragger>

            {/* 上传进度 */}
            {uploading && (
              <div className="mb-4">
                <Progress percent={uploadProgress} status="active" />
                <Text type="secondary">正在上传到七牛云...</Text>
              </div>
            )}

            {/* 已上传 / 已有图片列表 */}
            {imageEntries.length > 0 && (
              <div className="border border-gray-100 rounded-lg">
                {imageEntries.map((entry, idx) => {
                  return (
                    <div
                      key={entry.key}
                      className={`flex items-center gap-3 py-2 px-3 border-b border-gray-100 last:border-b-0 ${
                        entry.isPreview ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Text type="secondary" className="w-6 text-center shrink-0">
                        {idx + 1}
                      </Text>
                      <Image
                        src={entry.url}
                        width={56}
                        height={56}
                        className={`object-cover rounded-md shrink-0 ${
                          entry.isPreview ? 'ring-2 ring-blue-400' : ''
                        }`}
                        preview={{ mask: '预览' }}
                      />
                      <div className="flex-1 min-w-0">
                        <Paragraph ellipsis className="mb-1 text-xs">
                          {entry.url}
                        </Paragraph>
                        <Space size={4}>
                          <Select
                            size="small"
                            value={entry.imgType}
                            onChange={(val) => handleImageTypeChange(entry.key, val)}
                            className="!w-[210px]"
                          >
                            {IMG_TYPE_OPTIONS.map((opt) => {
                              const limit = MAX_BY_TYPE[opt.value];
                              const current = imageEntries.filter(
                                (e) => e.key !== entry.key && e.imgType === opt.value,
                              ).length;
                              const disabled = current >= limit;
                              return (
                                <Select.Option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={disabled}
                                >
                                  {opt.label}
                                  {disabled ? ` (已达上限)` : ''}
                                </Select.Option>
                              );
                            })}
                          </Select>
                          {entry.isPreview && (
                            <Tag color="blue" className="!m-0">
                              预览图
                            </Tag>
                          )}
                        </Space>
                      </div>
                      <Tooltip title="设为预览图">
                        <Button
                          type={entry.isPreview ? 'primary' : 'text'}
                          size="small"
                          icon={<StarOutlined />}
                          onClick={() => handleSetPreview(entry.key)}
                        />
                      </Tooltip>
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleRemoveImage(entry.key)}
                        />
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Templates;
