import { CheckOutlined, CloseOutlined, InboxOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CATEGORY_OPTIONS,
  createUploadRule,
  getUploadRules,
  TEMPLATE_CATEGORIES,
  updateUploadRule,
  uploadBatch,
  UploadRule,
  UploadRuleRight,
  UploadRuleWrong,
} from '../api';

const { Dragger } = Upload;
const { Title, Text } = Typography;

// ==================== 图片类型映射（预览用） ====================

const IMG_TYPE_MAP: Record<number, string> = { 0: '商品图', 1: '参考图', 2: '模特图' };

// ==================== 本地类型 ====================

interface BatchImageItem {
  /** 唯一标识 */
  key: string;
  /** 上传后的 url */
  url: string;
  /** 原始文件名 */
  name: string;
  /** true=正确示例, false=错误示例 */
  isCorrect: boolean;
  /** 描述备注 */
  desc: string;
}

// ==================== 组件 ====================

const UploadRules: React.FC = () => {
  // ---- 列表数据 ----
  const [rules, setRules] = useState<UploadRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | undefined>();

  // ---- 弹窗状态 ----
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UploadRule | null>(null);
  const [formCategory, setFormCategory] = useState('1');

  // ---- 批量图片状态 ----
  const [batchImages, setBatchImages] = useState<BatchImageItem[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchUploadProgress, setBatchUploadProgress] = useState(0);

  // ---- 预览 ----
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRule, setPreviewRule] = useState<UploadRule | null>(null);

  // ---- key 生成器 ----
  const keyCounter = useRef(0);
  const nextKey = () => `img_${++keyCounter.current}`;

  // ---- 上传防抖（beforeUpload 每文件触发一次，防抖收集完整文件列表后一次性上传） ----
  const pendingFilesRef = useRef<RcFile[]>([]);
  const beforeUploadTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ==================== 数据加载 ====================

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUploadRules(filterCategory);
      setRules(res.data);
      setDirty(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // ==================== 导出/导入 ====================

  const handleExport = useCallback(() => {
    const data = JSON.stringify(rules, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload-rules-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  }, [rules]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as UploadRule[];
        if (!Array.isArray(imported)) throw new Error('格式错误');
        setRules(imported);
        setDirty(true);
        message.success(`成功导入 ${imported.length} 条规则`);
      } catch {
        message.error('导入失败，请检查文件格式');
      }
    };
    input.click();
  }, []);

  // ==================== 删除 ====================

  const handleDelete = useCallback((id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setDirty(true);
    message.success('已删除');
  }, []);

  // ==================== 预览 ====================

  const handlePreview = useCallback((rule: UploadRule) => {
    setPreviewRule(rule);
    setPreviewOpen(true);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
    setPreviewRule(null);
  }, []);

  // ==================== 新增 / 编辑 ====================

  const handleAdd = useCallback(() => {
    setEditingRule(null);
    setFormCategory('1');
    setBatchImages([]);
    setBatchUploadProgress(0);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((rule: UploadRule) => {
    setEditingRule(rule);
    setFormCategory(rule.category);

    const items: BatchImageItem[] = [];

    // 正确示例 → 每张图一个 item
    for (const r of rule.right) {
      for (const img of r.params.taskConfig.images) {
        items.push({
          key: nextKey(),
          url: img.url,
          name: img.url.split('/').pop() || '',
          isCorrect: true,
          desc: r.desc,
        });
      }
    }

    // 错误示例
    for (const w of rule.wrong) {
      items.push({
        key: nextKey(),
        url: w.url,
        name: w.url.split('/').pop() || '',
        isCorrect: false,
        desc: w.desc,
      });
    }

    setBatchImages(items);
    setBatchUploadProgress(0);
    setModalOpen(true);
  }, []);

  const handleModalCancel = useCallback(() => {
    setModalOpen(false);
    setEditingRule(null);
    setBatchImages([]);
  }, []);

  // ==================== 批量图片操作 ====================

  const handleBeforeUpload = useCallback((_file: RcFile, fileList: RcFile[]) => {
    // beforeUpload 在选择 N 个文件时会触发 N 次，每次 fileList 逐渐递增
    // 用 ref 暂存最新文件列表，防抖后在 setTimeout 中一次性上传全部文件
    pendingFilesRef.current = fileList;

    if (beforeUploadTimerRef.current) {
      clearTimeout(beforeUploadTimerRef.current);
    }

    beforeUploadTimerRef.current = setTimeout(async () => {
      const files = pendingFilesRef.current as unknown as File[];
      if (files.length === 0) return;

      setBatchUploading(true);
      setBatchUploadProgress(0);

      const progressTimer = setInterval(() => {
        setBatchUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 12;
        });
      }, 200);

      try {
        const res = await uploadBatch(files);
        setBatchUploadProgress(100);

        const newItems: BatchImageItem[] = res.data.success.map((r) => ({
          key: `img_${++keyCounter.current}`,
          url: r.url,
          name: r.originalName,
          isCorrect: true, // 默认正确示例
          desc: '',
        }));

        setBatchImages((prev) => [...prev, ...newItems]);

        if (res.data.failed.length > 0) {
          message.warning(`${res.data.failed.length} 个文件上传失败`);
        }
        if (newItems.length > 0) {
          message.success(`成功上传 ${newItems.length} 个图片`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '批量上传失败';
        message.error(msg);
        setBatchUploadProgress(0);
      } finally {
        clearInterval(progressTimer);
        setBatchUploading(false);
      }
    }, 100);

    return false;
  }, []);

  const handleSetCorrect = useCallback((key: string) => {
    setBatchImages((prev) =>
      prev.map((item) => (item.key === key ? { ...item, isCorrect: true } : item)),
    );
  }, []);

  const handleSetWrong = useCallback((key: string) => {
    setBatchImages((prev) =>
      prev.map((item) => (item.key === key ? { ...item, isCorrect: false } : item)),
    );
  }, []);

  const handleBatchDescChange = useCallback((key: string, desc: string) => {
    setBatchImages((prev) => prev.map((item) => (item.key === key ? { ...item, desc } : item)));
  }, []);

  const handleRemoveBatchImage = useCallback((key: string) => {
    setBatchImages((prev) => prev.filter((item) => item.key !== key));
  }, []);

  // ==================== 提交 ====================

  const handleSubmit = useCallback(async () => {
    if (!formCategory) {
      message.warning('请选择分类');
      return;
    }

    const correctItems = batchImages.filter((item) => item.isCorrect);
    const wrongItems = batchImages.filter((item) => !item.isCorrect);

    if (correctItems.length === 0) {
      message.warning('至少需要一个正确示例');
      return;
    }

    const rightList: UploadRuleRight[] = correctItems.map((item) => ({
      desc: item.desc.trim(),
      params: {
        prompt: '',
        taskConfig: {
          images: [{ url: item.url, imgType: 0 }],
        },
      },
    }));

    const wrongList: UploadRuleWrong[] = wrongItems.map((item) => ({
      url: item.url,
      desc: item.desc.trim(),
    }));

    const input = {
      category: formCategory,
      right: rightList,
      wrong: wrongList,
    };

    try {
      if (editingRule) {
        await updateUploadRule(editingRule.category, editingRule.id, input);
        message.success('已更新');
      } else {
        await createUploadRule(input);
        message.success('已添加');
      }

      // 重新加载列表
      await loadRules();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败';
      message.error(msg);
      return;
    }

    setModalOpen(false);
    setEditingRule(null);
    setBatchImages([]);
  }, [batchImages, editingRule, formCategory, loadRules]);

  // ==================== 保存全部 ====================

  const handleSaveAll = useCallback(async () => {
    // 实际上保存是本地操作，这里只做提示
    // 如果需要真正持久化到服务器，可以在这里调用 API
    message.info('当前为前端管理页面，数据暂存于内存中。可通过「导出JSON」保存到本地文件。');
  }, []);

  // ==================== 统计 ====================

  const correctCount = batchImages.filter((i) => i.isCorrect).length;
  const wrongCount = batchImages.filter((i) => !i.isCorrect).length;

  // ==================== ImgRender（卡片预览） ====================

  function ImgRender(props: { url: string; desc: string }) {
    return (
      <div>
        <Image
          src={props.url}
          width={80}
          height={80}
          className="object-cover rounded border"
          preview={{ mask: '查看' }}
        />
        <p className="text-center text-xs">{props.desc}</p>
      </div>
    );
  }

  // ==================== 渲染 ====================

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={3} className="mb-0">
          上传规则管理
        </Title>
        <Space>
          <Select
            allowClear
            placeholder="筛选分类"
            value={filterCategory}
            onChange={(v) => setFilterCategory(v)}
            options={CATEGORY_OPTIONS}
            style={{ width: 160 }}
          />
          <Button onClick={handleImport}>导入 JSON</Button>
          <Button onClick={handleExport} disabled={rules.length === 0}>
            导出 JSON
          </Button>
          <Button type="primary" onClick={handleAdd}>
            新增规则
          </Button>
          {dirty && <Button onClick={handleSaveAll}>保存全部</Button>}
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {rules.map((rule) => {
            const rightImgCount = rule.right.reduce(
              (sum, r) => sum + r.params.taskConfig.images.length,
              0,
            );
            return (
              <Col xs={24} sm={12} md={8} lg={8} key={rule.id}>
                <Card
                  size="small"
                  title={
                    <span>
                      {TEMPLATE_CATEGORIES[rule.category] || `分类${rule.category}`} / {rule.id}
                    </span>
                  }
                  extra={
                    <Space size="small">
                      <Button type="link" size="small" onClick={() => handlePreview(rule)}>
                        预览
                      </Button>
                      <Button type="link" size="small" onClick={() => handleEdit(rule)}>
                        编辑
                      </Button>
                      {/* <Popconfirm title="确定删除？" onConfirm={() => handleDelete(rule.id)}>
                        <Button type="link" size="small" danger>
                          删除
                        </Button>
                      </Popconfirm> */}
                    </Space>
                  }
                >
                  {/* 正确示例 */}
                  <div>
                    <Divider>
                      <Text strong className="text-xs">
                        正确示例（{rightImgCount} 张）
                      </Text>
                    </Divider>
                    <div className="flex flex-wrap gap-1">
                      {rule.right.map((r, ri) => (
                        <div key={ri} className="mt-1">
                          <div className="flex gap-1 flex-wrap mb-1">
                            {r.params.taskConfig.images.map((img, ii) => (
                              <ImgRender key={ii} url={img.url} desc={r.desc} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 错误示例 */}
                  {rule.wrong.length > 0 && (
                    <>
                      <Divider>
                        <Text strong className="text-xs text-red-500">
                          错误示例（{rule.wrong.length} 张）
                        </Text>
                      </Divider>
                      <div className="flex flex-wrap gap-1">
                        {rule.wrong.map((w, wi) => (
                          <ImgRender key={wi} url={w.url} desc={w.desc} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* 更新时间 */}
                  <Divider className="my-2" />
                  <Text type="secondary" className="text-xs">
                    更新时间：{rule.updatedAt || ''}
                  </Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Spin>

      {/* ==================== 新增/编辑弹窗 ==================== */}
      <Modal
        title={editingRule ? '编辑上传规则' : '新增上传规则'}
        open={modalOpen}
        onCancel={handleModalCancel}
        onOk={handleSubmit}
        width={840}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <div className="mt-4 space-y-4">
          {/* 分类选择 */}
          <div>
            <Text strong className="block mb-1">
              分类
            </Text>
            <Select
              value={formCategory}
              onChange={setFormCategory}
              options={CATEGORY_OPTIONS}
              style={{ width: 240 }}
              placeholder="选择分类"
            />
          </div>

          {/* 批量图片上传 */}
          <div>
            <Text strong className="block mb-2">
              上传图片
            </Text>
                  <Dragger
                    multiple
                    accept="image/*"
                    disabled={batchUploading}
                    showUploadList={false}
                    beforeUpload={handleBeforeUpload}
                  >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">支持批量选择，上传后可手动标注正确/错误示例</p>
            </Dragger>
            {batchUploading && (
              <Progress
                percent={Math.round(batchUploadProgress)}
                status="active"
                className="mt-2"
              />
            )}
          </div>

          {/* 已上传图片列表 */}
          {batchImages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Text strong>已上传图片</Text>
                <Space size="small">
                  <Tag color="green">正确 {correctCount}</Tag>
                  <Tag color="red">错误 {wrongCount}</Tag>
                  <Text type="secondary" className="text-xs">
                    共 {batchImages.length} 张
                  </Text>
                </Space>
              </div>

              <div className="border rounded-lg max-h-[420px] overflow-auto">
                {batchImages.map((item, idx) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 py-2 px-3 border-b last:border-b-0 ${
                      item.isCorrect ? 'bg-[#f6ffed]' : 'bg-[#fff2f0]'
                    }`}
                  >
                    {/* 序号 */}
                    <Text type="secondary" className="w-6 text-center shrink-0">
                      {idx + 1}
                    </Text>

                    {/* 缩略图 */}
                    <Image
                      src={item.url}
                      width={52}
                      height={52}
                      className="object-cover rounded border shrink-0"
                      preview={{ mask: '查看' }}
                    />

                    {/* 描述输入 */}
                    <Input
                      className="flex-1"
                      size="small"
                      value={item.desc}
                      onChange={(e) => handleBatchDescChange(item.key, e.target.value)}
                      placeholder="输入图片描述/备注"
                      status={!item.desc.trim() ? 'warning' : undefined}
                    />

                    {/* 正确/错误切换 */}
                    <Space.Compact className="shrink-0">
                      <Button
                        size="small"
                        type={item.isCorrect ? 'primary' : 'default'}
                        icon={<CheckOutlined />}
                        onClick={() => handleSetCorrect(item.key)}
                      >
                        正确
                      </Button>
                      <Button
                        size="small"
                        type={!item.isCorrect ? 'primary' : 'default'}
                        danger={!item.isCorrect}
                        icon={<CloseOutlined />}
                        onClick={() => handleSetWrong(item.key)}
                      >
                        错误
                      </Button>
                    </Space.Compact>

                    {/* 删除 */}
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleRemoveBatchImage(item.key)}
                      className="shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ==================== 预览弹窗 ==================== */}
      <Modal
        title="规则预览"
        open={previewOpen}
        onCancel={handlePreviewClose}
        footer={null}
        width={720}
      >
        {previewRule && (
          <div className="space-y-4 mt-4">
            <Text>
              分类：{TEMPLATE_CATEGORIES[previewRule.category] || `分类${previewRule.category}`}
            </Text>

            {/* 正确示例 */}
            <div>
              <Text strong className="block mb-2">
                <Tag color="green">正确示例 ({previewRule.right.length} 组)</Tag>
              </Text>
              {previewRule.right.map((r, ri) => (
                <Card key={ri} size="small" className="mb-2">
                  <Text strong>描述：</Text>
                  <Text>{r.desc || '无'}</Text>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {r.params.taskConfig.images.map((img, ii) => (
                      <div key={ii} className="text-center">
                        <Image
                          src={img.url}
                          width={100}
                          height={100}
                          className="object-cover rounded"
                        />
                        <Text type="secondary" className="block text-xs">
                          {IMG_TYPE_MAP[img.imgType] || `类型${img.imgType}`}
                        </Text>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* 错误示例 */}
            {previewRule.wrong.length > 0 && (
              <div>
                <Text strong className="block mb-2">
                  <Tag color="error">错误示例 ({previewRule.wrong.length})</Tag>
                </Text>
                {previewRule.wrong.map((w, wi) => (
                  <Card key={wi} size="small" className="mb-2">
                    <div className="flex gap-3">
                      <Image src={w.url} width={80} height={80} className="object-cover rounded" />
                      <div>
                        <Text strong>描述：</Text>
                        <Text>{w.desc || '无'}</Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UploadRules;
