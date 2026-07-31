import {
  CheckCircleOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  InboxOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Collapse,
  Divider,
  Empty,
  Image,
  message,
  Progress,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile, UploadFile } from 'antd/es/upload';
import { useCallback, useRef, useState } from 'react';

import { syncCategoryTemplates, uploadBatch, UploadResult } from '../api';

const { Dragger } = Upload;
const { Title, Text } = Typography;

async function format(data, category: number) {
  const result: {
    id: number;
    cid: string;
    category: string;
    preview: string;
    params: {
      prompt: string;
      taskConfig: { images: { url: string; imgType: number }[] };
    };
  }[] = [];

  data.forEach((file) => {
    const arr = file.originalName.split('/');
    const cid = arr[1].split('_')[1];

    const groupIndex = result.findIndex((item) => item.cid === cid);

    const group =
      groupIndex > -1
        ? result[groupIndex]
        : {
            id: result.length,
            cid,
            category: String(category),
            preview: '',
            params: {
              prompt: '',
              taskConfig: { images: [] },
            },
          };

    if (file.originalName.includes('案例大图')) {
      group.preview = file.url;
    }

    if (
      file.originalName.includes('商品图') ||
      file.originalName.includes('平铺图') ||
      file.originalName.includes('原图') ||
      file.originalName.includes('版式图')
    ) {
      group.params.taskConfig.images.push({
        url: file.url,
        imgType: 0,
      });
    }

    if (
      file.originalName.includes('面料图') ||
      file.originalName.includes('参考图') ||
      file.originalName.includes('背景图')
    ) {
      group.params.taskConfig.images.push({
        url: file.url,
        imgType: 1,
      });
    }

    if (groupIndex == -1) {
      result.push(group);
    }
  });

  if (result.length === 0) {
    message.warning('没有可同步的数据');
    return;
  }

  const hideLoading = message.loading(`正在同步 ${result.length} 条模板到分类 ${category}...`, 0);
  try {
    await syncCategoryTemplates(String(category), result);
    hideLoading();
    message.success(
      `已同步 ${result.length} 条模板到 packages/server/data/templates/${category}.json`,
    );
  } catch (err: unknown) {
    hideLoading();
    const msg = err instanceof Error ? err.message : '同步失败';
    message.error(`同步模板失败: ${msg}`);
  }
}

// ==================== 工具函数 ====================

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function isImage(name: string): boolean {
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    message.success('已复制到剪贴板');
  }
}

// ==================== 文件夹文件类型 ====================

interface FolderFile {
  /** 文件相对于选中文件夹的路径 */
  relativePath: string;
  /** 原始 File 对象 */
  file: File;
}

/** 按目录分组 */
interface FileGroup {
  dir: string;
  files: FolderFile[];
}

// ==================== 组件 ====================

const UploadPage: React.FC = () => {
  // ---- 拖拽/选择文件模式 ----
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: UploadResult[];
    failed: { originalName: string; error: string }[];
  } | null>(null);

  // ---- 文件夹上传模式 ----
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [folderFiles, setFolderFiles] = useState<FolderFile[]>([]);
  const [folderName, setFolderName] = useState('');
  const [folderUploading, setFolderUploading] = useState(false);
  const [folderProgress, setFolderProgress] = useState(0);
  const [folderResults, setFolderResults] = useState<{
    success: UploadResult[];
    failed: { originalName: string; error: string }[];
  } | null>(null);

  // ==================== 拖拽模式 ====================

  const handleBeforeUpload = useCallback((_file: RcFile, newFileList: RcFile[]) => {
    // RcFile 没有 originFileObj，需包装为 UploadFile 格式，
    // 否则 handleUpload 中 f.originFileObj 为 undefined，数据无法传给服务端
    const wrapped: UploadFile[] = newFileList.map((f) => ({
      uid: f.uid,
      name: f.name,
      size: f.size,
      type: f.type,
      originFileObj: f as RcFile,
    }));
    setFileList(wrapped);
    setResults(null);
    return false;
  }, []);

  const handleRemove = useCallback((file: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    setResults(null);
  }, []);

  const handleClear = useCallback(() => {
    setFileList([]);
    setResults(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults(null);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const rawFiles = fileList.map((f) => f.originFileObj).filter(Boolean) as File[];
      const res = await uploadBatch(rawFiles);
      setResults(res.data);
      setProgress(100);

      const { success: s, failed: f } = res.data;
      if (f.length === 0) {
        message.success(`全部 ${s.length} 个文件上传成功`);
      } else if (s.length === 0) {
        message.error(`全部 ${f.length} 个文件上传失败`);
      } else {
        message.warning(`${s.length} 个成功, ${f.length} 个失败`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '上传失败';
      message.error(msg);
      setProgress(0);
    } finally {
      clearInterval(progressTimer);
      setUploading(false);
    }
  }, [fileList]);

  // ==================== 文件夹模式 ====================

  const handleOpenFolder = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  const handleFolderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawFiles = input.files;
    if (!rawFiles || rawFiles.length === 0) return;

    const items: FolderFile[] = [];
    let folderRoot = '';

    for (let i = 0; i < rawFiles.length; i++) {
      const f = rawFiles[i];
      // 只处理图片文件
      if (!isImage(f.name)) continue;
      // webkitRelativePath 格式: "folderName/sub/file.png"
      const rp = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
      if (!folderRoot) {
        folderRoot = rp.split('/')[0];
      }
      items.push({ relativePath: rp, file: f });
    }

    setFolderName(folderRoot || '未命名文件夹');
    setFolderFiles(items);
    setFolderResults(null);

    // 清空 input 使重复选择同一文件夹时仍触发 change
    input.value = '';
  }, []);

  const handleRemoveFolderFile = useCallback((index: number) => {
    setFolderFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setFolderName('');
      return next;
    });
    setFolderResults(null);
  }, []);

  const handleClearFolder = useCallback(() => {
    setFolderFiles([]);
    setFolderName('');
    setFolderResults(null);
  }, []);

  const handleFolderUpload = useCallback(async () => {
    if (folderFiles.length === 0) {
      message.warning('请先选择文件夹');
      return;
    }

    setFolderUploading(true);
    setFolderProgress(0);
    setFolderResults(null);

    const progressTimer = setInterval(() => {
      setFolderProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const files = folderFiles.map((item) => item.file);
      const res = await uploadBatch(files);
      setFolderResults(res.data);
      setFolderProgress(100);
      await format(res.data.success, 1);

      const { success: s, failed: f } = res.data;
      if (f.length === 0) {
        message.success(`文件夹「${folderName}」全部 ${s.length} 个文件上传成功`);
      } else if (s.length === 0) {
        message.error(`全部 ${f.length} 个文件上传失败`);
      } else {
        message.warning(`${s.length} 个成功, ${f.length} 个失败`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '文件夹上传失败';
      message.error(msg);
      setFolderProgress(0);
    } finally {
      clearInterval(progressTimer);
      setFolderUploading(false);
    }
  }, [folderFiles, folderName]);

  // 将文件夹文件按目录分组
  const fileGroups: FileGroup[] = (() => {
    const map = new Map<string, FolderFile[]>();
    for (const item of folderFiles) {
      const dir = item.relativePath.includes('/')
        ? item.relativePath.substring(0, item.relativePath.lastIndexOf('/'))
        : '根目录';
      if (!map.has(dir)) map.set(dir, []);
      map.get(dir)!.push(item);
    }
    return Array.from(map.entries()).map(([dir, files]) => ({ dir, files }));
  })();

  // ==================== 结果表格列（共用） ====================

  const successColumns: ColumnsType<UploadResult> = [
    {
      title: '预览',
      key: 'preview',
      width: 72,
      render: (_, r) =>
        isImage(r.originalName) ? (
          <Image
            src={r.url}
            alt={r.originalName}
            width={48}
            height={48}
            className="object-cover rounded"
            preview={{ mask: '查看' }}
          />
        ) : (
          <div className="w-12 h-12 bg-[#f5f5f5] rounded flex items-center justify-center">
            <FileOutlined className="text-2xl text-[#999]" />
          </div>
        ),
    },
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      ellipsis: true,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (s: number) => formatSize(s),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: () => <Tag color="success">成功</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, r) => (
        <Tooltip title="复制 URL">
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(r.url)}
          />
        </Tooltip>
      ),
    },
  ];

  const failedColumns: ColumnsType<{ originalName: string; error: string }> = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      ellipsis: true,
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: () => <Tag color="error">失败</Tag>,
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      ellipsis: true,
      render: (e: string) => (
        <Tooltip title={e}>
          <Text type="danger">{e}</Text>
        </Tooltip>
      ),
    },
  ];

  const hasResults = results && (results.success.length > 0 || results.failed.length > 0);
  const hasFolderResults =
    folderResults && (folderResults.success.length > 0 || folderResults.failed.length > 0);

  const totalFolderSize = folderFiles.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div>
      <Title level={3} className="mb-6">
        文件上传
      </Title>

      {/* 七牛配置提示 */}
      <Alert
        type="info"
        showIcon
        message="使用前请确保已配置七牛云环境变量（QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET）"
        className="mb-4"
        closable
      />

      <Tabs
        defaultActiveKey="single"
        items={[
          // ==================== Tab 1: 拖拽上传 ====================
          {
            key: 'single',
            label: '拖拽上传',
            children: (
              <Card>
                <Dragger
                  multiple
                  fileList={fileList}
                  beforeUpload={handleBeforeUpload}
                  onRemove={handleRemove}
                  showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar,.mp4,.mp3"
                  disabled={uploading}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域</p>
                  <p className="ant-upload-hint">
                    支持图片、文档、音视频、压缩包等常见格式，单文件最大 50MB，最多 20 个文件
                  </p>
                </Dragger>

                {fileList.length > 0 && (
                  <div className="mt-4 flex gap-3 items-center">
                    <Button
                      type="primary"
                      size="large"
                      icon={<UploadOutlined />}
                      onClick={handleUpload}
                      loading={uploading}
                    >
                      {uploading ? '上传中...' : `上传 ${fileList.length} 个文件`}
                    </Button>
                    <Button
                      size="large"
                      icon={<ClearOutlined />}
                      onClick={handleClear}
                      disabled={uploading}
                    >
                      清空
                    </Button>
                    <Text type="secondary">已选择 {fileList.length} 个文件</Text>
                  </div>
                )}

                {uploading && (
                  <div className="mt-4">
                    <Progress percent={Math.round(progress)} status="active" />
                  </div>
                )}
              </Card>
            ),
          },

          // ==================== Tab 2: 文件夹上传 ====================
          {
            key: 'folder',
            label: '文件夹上传',
            children: (
              <div>
                {/* 隐藏的文件夹选择 input */}
                <input
                  ref={folderInputRef}
                  type="file"
                  /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                  // @ts-ignore webkitdirectory 是非标准属性
                  webkitdirectory=""
                  multiple
                  onChange={handleFolderChange}
                  style={{ display: 'none' }}
                />

                <Card>
                  {/* 选择文件夹按钮 */}
                  <div className="text-center py-8">
                    <Button
                      type="dashed"
                      size="large"
                      icon={<FolderOpenOutlined />}
                      onClick={handleOpenFolder}
                      disabled={folderUploading}
                      className="h-20 px-12"
                    >
                      <div className="text-base leading-6">
                        <div>点击选择文件夹</div>
                        <Text type="secondary" className="text-xs">
                          将上传文件夹内所有文件（包含子目录）
                        </Text>
                      </div>
                    </Button>
                  </div>

                  {/* 已选文件夹信息 & 文件列表 */}
                  {folderFiles.length > 0 && (
                    <>
                      <Divider />

                      <div className="flex gap-3 items-center mb-4">
                        <FolderOutlined className="text-lg text-[#1677ff]" />
                        <Text strong className="text-base">
                          {folderName}
                        </Text>
                        <Tag>{folderFiles.length} 个文件</Tag>
                        <Tag>{formatSize(totalFolderSize)}</Tag>
                      </div>

                      {/* 按子目录折叠展示 */}
                      <Collapse
                        size="small"
                        defaultActiveKey={fileGroups.map((g) => g.dir)}
                        items={fileGroups.map((group) => ({
                          key: group.dir,
                          label: (
                            <Space>
                              <FolderOutlined />
                              <Text strong>{group.dir}</Text>
                              <Tag className="ml-2">{group.files.length} 个</Tag>
                            </Space>
                          ),
                          children: (
                            <div className="max-h-80 overflow-auto">
                              {group.files.map((item, idx) => {
                                // 在全局 folderFiles 中找到对应下标
                                const globalIdx = folderFiles.indexOf(item);
                                return (
                                  <div
                                    key={`${item.relativePath}-${idx}`}
                                    className="flex items-center justify-between py-1 px-2 hover:bg-[#fafafa] rounded"
                                  >
                                    <Space>
                                      <FileOutlined className="text-[#999]" />
                                      <Text className="text-sm">{item.file.name}</Text>
                                      <Text type="secondary" className="text-xs">
                                        {formatSize(item.file.size)}
                                      </Text>
                                    </Space>
                                    <Button
                                      type="link"
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleRemoveFolderFile(globalIdx)}
                                      disabled={folderUploading}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ),
                        }))}
                      />

                      {/* 操作按钮 */}
                      <div className="mt-4 flex gap-3 items-center">
                        <Button
                          type="primary"
                          size="large"
                          icon={<UploadOutlined />}
                          onClick={handleFolderUpload}
                          loading={folderUploading}
                        >
                          {folderUploading
                            ? '上传中...'
                            : `上传文件夹（${folderFiles.length} 个文件）`}
                        </Button>
                        <Button
                          size="large"
                          icon={<ClearOutlined />}
                          onClick={handleClearFolder}
                          disabled={folderUploading}
                        >
                          清空
                        </Button>
                        <Text type="secondary">
                          共 {fileGroups.length} 个子目录，{folderFiles.length} 个文件
                        </Text>
                      </div>
                    </>
                  )}
                </Card>

                {/* 上传进度 */}
                {folderUploading && (
                  <div className="mt-4">
                    <Progress percent={Math.round(folderProgress)} status="active" />
                  </div>
                )}

                {/* 文件夹上传结果 */}
                {hasFolderResults && (
                  <Card title="上传结果" className="mt-6">
                    <Tabs
                      items={[
                        {
                          key: 'success',
                          label: (
                            <Space>
                              <CheckCircleOutlined className="text-[#52c41a]" />
                              上传成功 ({folderResults.success.length})
                            </Space>
                          ),
                          children:
                            folderResults.success.length > 0 ? (
                              <Table
                                rowKey="key"
                                columns={successColumns}
                                dataSource={folderResults.success}
                                pagination={false}
                                size="middle"
                              />
                            ) : (
                              <Empty description="无成功文件" />
                            ),
                        },
                        ...(folderResults.failed.length > 0
                          ? [
                              {
                                key: 'failed',
                                label: (
                                  <Space>
                                    <CloseCircleOutlined className="text-[#ff4d4f]" />
                                    上传失败 ({folderResults.failed.length})
                                  </Space>
                                ),
                                children: (
                                  <Table
                                    rowKey="originalName"
                                    columns={failedColumns}
                                    dataSource={folderResults.failed}
                                    pagination={false}
                                    size="middle"
                                  />
                                ),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </Card>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* 拖拽模式上传结果 */}
      {hasResults && (
        <Card title="上传结果" className="mt-6">
          <Tabs
            items={[
              {
                key: 'success',
                label: (
                  <Space>
                    <CheckCircleOutlined className="text-[#52c41a]" />
                    上传成功 ({results.success.length})
                  </Space>
                ),
                children:
                  results.success.length > 0 ? (
                    <Table
                      rowKey="key"
                      columns={successColumns}
                      dataSource={results.success}
                      pagination={false}
                      size="middle"
                    />
                  ) : (
                    <Empty description="无成功文件" />
                  ),
              },
              ...(results.failed.length > 0
                ? [
                    {
                      key: 'failed',
                      label: (
                        <Space>
                          <CloseCircleOutlined className="text-[#ff4d4f]" />
                          上传失败 ({results.failed.length})
                        </Space>
                      ),
                      children: (
                        <Table
                          rowKey="originalName"
                          columns={failedColumns}
                          dataSource={results.failed}
                          pagination={false}
                          size="middle"
                        />
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </Card>
      )}

      {/* 使用说明 */}
      {!hasResults &&
        !hasFolderResults &&
        !uploading &&
        !folderUploading &&
        fileList.length === 0 &&
        folderFiles.length === 0 && (
          <Card className="mt-6">
            <Title level={5}>使用说明</Title>
            <Space direction="vertical" size="small">
              <Text>
                1. 在 <Tag>packages/server/.env</Tag> 中配置七牛云凭证
              </Text>
              <Text>2. 拖拽上传：拖拽或点击选择要上传的单个/多个文件</Text>
              <Text>3. 文件夹上传：点击选择文件夹，自动遍历上传其中所有文件（含子目录）</Text>
              <Text>4. 点击「上传」按钮将文件批量上传至七牛云</Text>
              <Text>5. 上传完成后可直接复制文件访问 URL</Text>
            </Space>
            <Divider />
            <Text type="secondary">
              支持的文件类型：图片 (jpg/png/gif/webp/svg)、文档 (pdf/doc/xlsx/txt/csv)、音视频
              (mp4/mp3)、压缩包 (zip/rar)
            </Text>
          </Card>
        )}
    </div>
  );
};

export default UploadPage;
