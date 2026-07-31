import {
  DeleteOutlined,
  HolderOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CarouselDemo,
  CarouselInput,
  CarouselItem,
  CarouselPreview,
  createCarousel,
  deleteCarousel,
  getCarouselList,
  getMenus,
  TEMPLATE_CATEGORIES,
  updateCarousel,
  uploadBatch,
} from '../api';

const { Dragger } = Upload;
const { Title, Text } = Typography;

// ==================== 本地类型 ====================

/** 弹窗内一个 demo 组的临时数据 */
interface DemoGroupForm {
  key: string;
  previews: (CarouselPreview & { key: string })[];
  prompt: string;
}

// ==================== 组件 ====================

const CarouselPage: React.FC = () => {
  // ---- 列表数据 ----
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);

  // ---- 弹窗状态 ----
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [formCategory, setFormCategory] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [demoGroups, setDemoGroups] = useState<DemoGroupForm[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ---- 批量上传 loading 状态 ----
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());

  // ---- key 生成器 ----
  const keyCounter = useRef(0);
  const nextKey = useCallback(() => `k_${++keyCounter.current}`, []);

  // ---- 拖拽排序状态 ----
  const dragDemoKey = useRef<string | null>(null);
  const dragPreviewDemoKey = useRef<string | null>(null);
  const dragPreviewKey = useRef<string | null>(null);

  // 数组元素交换工具
  const arrayMove = useCallback(<T,>(arr: T[], fromIndex: number, toIndex: number): T[] => {
    const next = [...arr];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
  }, []);

  // ==================== 数据加载 ====================

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
      .catch(() => {});
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCarouselList(filterCategory);
      setItems(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ==================== 弹窗操作 ====================

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormCategory('');
    setFormTitle('');
    setDemoGroups([{ key: nextKey(), previews: [], prompt: '' }]);
    setModalOpen(true);
  }, [nextKey]);

  const handleEdit = useCallback(
    (item: CarouselItem) => {
      setEditingItem(item);
      setFormCategory(item.category);
      setFormTitle(item.title);
      setDemoGroups(
        item.demos.map((d) => ({
          key: nextKey(),
          previews: d.previews.map((p) => ({ ...p, key: nextKey() })),
          prompt: d.params.prompt || '',
        })),
      );
      setModalOpen(true);
    },
    [nextKey],
  );

  const handleModalCancel = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
    setDemoGroups([]);
  }, []);

  // ==================== Demo 组操作 ====================

  const addDemoGroup = useCallback(() => {
    setDemoGroups((prev) => [...prev, { key: nextKey(), previews: [], prompt: '' }]);
  }, [nextKey]);

  const removeDemoGroup = useCallback((key: string) => {
    setDemoGroups((prev) => prev.filter((g) => g.key !== key));
  }, []);

  // ==================== 批量上传图片 ====================

  const handleBatchUpload = useCallback(
    async (demoKey: string, files: RcFile[]) => {
      const key = demoKey;
      setUploadingKeys((prev) => new Set(prev).add(key));

      const hideLoading = message.loading(`正在上传 ${files.length} 张图片...`, 0);
      try {
        const res = await uploadBatch(files as unknown as File[]);
        hideLoading();

        const urls = res.data.success.map((s) => s.url);
        if (urls.length === 0) {
          message.warning('没有上传成功的图片');
          return;
        }

        // 将上传成功的图片添加为新的 preview 条目
        setDemoGroups((prev) =>
          prev.map((g) => {
            if (g.key !== demoKey) return g;
            const newPreviews = urls.map((url) => ({
              key: nextKey(),
              desc: '',
              img: url,
              imgType: undefined as number | undefined,
            }));
            const merged = [...g.previews, ...newPreviews];
            // 限制最多 4 张
            const capped = merged.slice(0, 4);
            return { ...g, previews: capped };
          }),
        );

        const skipped = res.data.failed.length > 0 ? `，${res.data.failed.length} 张失败` : '';
        const overflow = urls.length > 4 ? '，已自动截取前 4 张' : '';
        message.success(`成功上传 ${urls.length} 张${skipped}${overflow}`);
      } catch (err: unknown) {
        hideLoading();
        const msg = err instanceof Error ? err.message : '上传失败';
        message.error(`批量上传失败: ${msg}`);
      } finally {
        setUploadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [nextKey],
  );

  // ==================== Preview 操作 ====================

  const removePreview = useCallback((demoKey: string, previewKey: string) => {
    setDemoGroups((prev) =>
      prev.map((g) =>
        g.key === demoKey ? { ...g, previews: g.previews.filter((p) => p.key !== previewKey) } : g,
      ),
    );
  }, []);

  const updatePreviewField = useCallback(
    (demoKey: string, previewKey: string, field: keyof CarouselPreview, value: unknown) => {
      setDemoGroups((prev) =>
        prev.map((g) =>
          g.key === demoKey
            ? {
                ...g,
                previews: g.previews.map((p) =>
                  p.key === previewKey ? { ...p, [field]: value } : p,
                ),
              }
            : g,
        ),
      );
    },
    [],
  );

  const updateDemoPrompt = useCallback((demoKey: string, prompt: string) => {
    setDemoGroups((prev) => prev.map((g) => (g.key === demoKey ? { ...g, prompt } : g)));
  }, []);

  // ==================== 轮播组拖拽排序 ====================

  const handleDemoDragStart = useCallback((key: string) => {
    dragDemoKey.current = key;
  }, []);

  const handleDemoDragOver = useCallback(
    (e: React.DragEvent, targetKey: string) => {
      e.preventDefault();
      if (!dragDemoKey.current || dragDemoKey.current === targetKey) return;
      setDemoGroups((prev) => {
        const fromIndex = prev.findIndex((g) => g.key === dragDemoKey.current);
        const toIndex = prev.findIndex((g) => g.key === targetKey);
        if (fromIndex === -1 || toIndex === -1) return prev;
        return arrayMove(prev, fromIndex, toIndex);
      });
    },
    [arrayMove],
  );

  const handleDemoDragEnd = useCallback(() => {
    dragDemoKey.current = null;
  }, []);

  // ==================== 组内图片拖拽排序 ====================

  const handlePreviewDragStart = useCallback((demoKey: string, previewKey: string) => {
    dragPreviewDemoKey.current = demoKey;
    dragPreviewKey.current = previewKey;
  }, []);

  const handlePreviewDragOver = useCallback(
    (e: React.DragEvent, demoKey: string, targetPreviewKey: string) => {
      e.preventDefault();
      if (
        !dragPreviewKey.current ||
        !dragPreviewDemoKey.current ||
        dragPreviewDemoKey.current !== demoKey ||
        dragPreviewKey.current === targetPreviewKey
      )
        return;
      setDemoGroups((prev) =>
        prev.map((g) => {
          if (g.key !== demoKey) return g;
          const fromIndex = g.previews.findIndex((p) => p.key === dragPreviewKey.current);
          const toIndex = g.previews.findIndex((p) => p.key === targetPreviewKey);
          if (fromIndex === -1 || toIndex === -1) return g;
          return { ...g, previews: arrayMove(g.previews, fromIndex, toIndex) };
        }),
      );
    },
    [arrayMove],
  );

  const handlePreviewDragEnd = useCallback(() => {
    dragPreviewDemoKey.current = null;
    dragPreviewKey.current = null;
  }, []);

  // ==================== 提交 ====================

  const handleSubmit = useCallback(async () => {
    if (!formCategory) {
      message.warning('请选择分类');
      return;
    }
    if (!formTitle.trim()) {
      message.warning('请输入标题');
      return;
    }

    // 校验每个 demo 至少有 1 张预览图，最多 4 张
    for (let i = 0; i < demoGroups.length; i++) {
      const count = demoGroups[i].previews.length;
      if (count < 1 || count > 4) {
        message.warning(`第 ${i + 1} 组轮播预览图数量需在 1-4 张之间`);
        return;
      }
    }

    const demos: CarouselDemo[] = demoGroups.map((g) => ({
      previews: g.previews.map((p) => ({
        desc: p.desc,
        img: p.img,
        imgType: p.imgType,
      })),
      params: { prompt: g.prompt },
    }));

    const input: CarouselInput = {
      category: formCategory,
      title: formTitle.trim(),
      demos,
    };

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateCarousel(editingItem.id, input);
        message.success('已更新');
      } else {
        await createCarousel(input);
        message.success('已添加');
      }
      await loadItems();
      setModalOpen(false);
      setEditingItem(null);
      setDemoGroups([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [demoGroups, editingItem, formCategory, formTitle, loadItems]);

  // ==================== 删除 ====================

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteCarousel(id);
        message.success('已删除');
        await loadItems();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '删除失败';
        message.error(msg);
      }
    },
    [loadItems],
  );

  // ==================== 渲染 ====================

  const filteredItems = useMemo(() => {
    if (!filterCategory) return items;
    return items.filter((item) => item.category === filterCategory);
  }, [items, filterCategory]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={3} className="mb-0">
          轮播图管理
        </Title>
        <Space>
          <Select
            allowClear
            placeholder="筛选分类"
            value={filterCategory}
            onChange={(v) => setFilterCategory(v)}
            options={categoryOptions}
            style={{ width: 180 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增轮播图
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {filteredItems.length === 0 && !loading ? (
          <div className="text-center py-20">
            <Text type="secondary" className="text-lg">
              暂无轮播图数据
            </Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredItems.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  size="small"
                  title={TEMPLATE_CATEGORIES[item.category] || item.category}
                  extra={
                    <Space size="small">
                      <Button type="link" size="small" onClick={() => handleEdit(item)}>
                        编辑
                      </Button>
                      <Popconfirm title="确定删除？" onConfirm={() => handleDelete(item.id)}>
                        <Button type="link" size="small" danger>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  }
                >
                  <p>{item.title}</p>
                  <Text type="secondary" className="block mt-2 text-xs">
                    {item.demos.length} 组轮播
                  </Text>
                  {/* 预览图横向滚动 */}
                  <div className="mt-2 pb-1">
                    {item.demos.slice(0, 3).map((demo, di) => (
                      <div key={di} className="mb-4 flex gap-1">
                        {demo.previews.map((p, _pi) => (
                          <div key={_pi}>
                            {p.img ? (
                              <Image
                                src={p.img}
                                width={80}
                                height={80}
                                className="object-cover rounded border"
                                preview={{ mask: '查看' }}
                              />
                            ) : (
                              <div className="w-20 h-20 rounded border bg-gray-50 flex items-center justify-center">
                                <Text type="secondary" className="text-xs">
                                  无图
                                </Text>
                              </div>
                            )}
                            <div className="text-xs text-center">{p.desc}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                    {item.demos.length > 3 && (
                      <Text type="secondary" className="text-xs shrink-0 self-center">
                        +{item.demos.length - 3} 组
                      </Text>
                    )}
                  </div>
                  <Text type="secondary" className="block mt-2 text-xs">
                    更新时间：{item.updatedAt || ''}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* ==================== 新增/编辑弹窗 ==================== */}
      <Modal
        title={editingItem ? '编辑轮播图' : '新增轮播图'}
        open={modalOpen}
        onCancel={handleModalCancel}
        onOk={handleSubmit}
        width={900}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
      >
        <div className="mt-4 space-y-4">
          {/* 分类 & 标题 */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="分类" required>
                <Select
                  value={formCategory || undefined}
                  onChange={setFormCategory}
                  options={categoryOptions}
                  placeholder="选择分类"
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="标题" required>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="如：只需一张平铺图，得到服装3D效果图"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Demo 组列表 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Text strong>轮播组</Text>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addDemoGroup}>
                新增轮播组
              </Button>
            </div>

            {demoGroups.map((demo, di) => (
              <div
                key={demo.key}
                onDragOver={(e) => handleDemoDragOver(e, demo.key)}
                onDrop={handleDemoDragEnd}
              >
                <Card
                  size="small"
                  className="mb-3"
                  title={
                    <div className="flex items-center gap-2 select-none">
                      <span
                        draggable
                        className="cursor-grab inline-flex items-center"
                        onDragStart={() => handleDemoDragStart(demo.key)}
                      >
                        <HolderOutlined className="text-gray-400" />
                      </span>
                      <Space>
                        <Tag color="processing">第 {di + 1} 组</Tag>
                        <Text type="secondary" className="text-xs">
                          ({demo.previews.length}/4 张预览图)
                        </Text>
                      </Space>
                    </div>
                  }
                  extra={
                    demoGroups.length > 1 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeDemoGroup(demo.key)}
                      >
                        删除此组
                      </Button>
                    )
                  }
                >
                  {/* 批量上传区域 */}
                  {demo.previews.length < 4 && (
                    <div className="mb-4">
                      <Dragger
                        multiple
                        accept="image/*"
                        showUploadList={false}
                        disabled={uploadingKeys.has(demo.key)}
                        beforeUpload={(file, _fileList) => {
                          // antd v5 的 beforeUpload fileList 类型为 RcFile[]，但运行时对象有 status/uid
                          const fileList = _fileList as Array<
                            RcFile & { status?: string; uid: string }
                          >;
                          // 等到最后一批文件都解析完再触发批量上传
                          if (fileList.every((f) => f.uid === file.uid || f.status === 'done')) {
                            const remaining = 4 - demo.previews.length;
                            const toUpload = fileList.slice(0, remaining) as RcFile[];
                            handleBatchUpload(demo.key, toUpload);
                          }
                          return false;
                        }}
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽图片到此区域批量上传</p>
                        <p className="ant-upload-hint">
                          支持同时选择多张图片（剩余 {4 - demo.previews.length} 张）
                        </p>
                      </Dragger>
                    </div>
                  )}

                  {/* Preview 列表 */}
                  {demo.previews.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {demo.previews.map((preview, pi) => (
                        <div
                          key={preview.key}
                          onDragOver={(e) => handlePreviewDragOver(e, demo.key, preview.key)}
                          onDrop={handlePreviewDragEnd}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded"
                        >
                          <span
                            draggable
                            className="cursor-grab inline-flex items-center shrink-0"
                            onDragStart={() => handlePreviewDragStart(demo.key, preview.key)}
                          >
                            <HolderOutlined className="text-gray-400" />
                          </span>
                          <div className="flex items-start gap-3 flex-1">
                            {/* 图片预览 */}
                            <div className="shrink-0">
                              <div className="relative group">
                                <Image
                                  src={preview.img}
                                  width={100}
                                  height={100}
                                  className="object-cover rounded border"
                                  preview={{ mask: '查看' }}
                                />
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  className="absolute -top-2 -right-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removePreview(demo.key, preview.key)}
                                  title="删除此图"
                                />
                              </div>
                            </div>

                            {/* desc + imgType */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <Text type="secondary" className="text-xs mb-1 block">
                                  图片说明（第 {pi + 1} 张）
                                </Text>
                                <Input
                                  placeholder="如：上传平铺图"
                                  value={preview.desc}
                                  onChange={(e) =>
                                    updatePreviewField(
                                      demo.key,
                                      preview.key,
                                      'desc',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Text type="secondary" className="text-xs mb-1 block">
                                  图片类型
                                </Text>
                                <Select
                                  placeholder="选择图片类型"
                                  allowClear
                                  value={preview.imgType}
                                  onChange={(v) =>
                                    updatePreviewField(demo.key, preview.key, 'imgType', v)
                                  }
                                  style={{ width: 180 }}
                                  options={[
                                    { value: 0, label: '商品图 (imgType=0)' },
                                    { value: 1, label: '参考图 (imgType=1)' },
                                  ]}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prompt */}
                  <div className="mt-3">
                    <Text type="secondary" className="text-xs mb-1 block">
                      Prompt（可选）
                    </Text>
                    <Input.TextArea
                      rows={2}
                      value={demo.prompt}
                      onChange={(e) => updateDemoPrompt(demo.key, e.target.value)}
                      placeholder="输入 prompt..."
                    />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CarouselPage;
