import crypto from 'node:crypto';
import path from 'node:path';

import qiniu from 'qiniu';
import sharp from 'sharp';

// ==================== 七牛配置 ====================

const config = {
  accessKey: process.env.QINIU_ACCESS_KEY || '',
  secretKey: process.env.QINIU_SECRET_KEY || '',
  bucket: process.env.QINIU_BUCKET || '',
  domain: process.env.QINIU_DOMAIN || '', // CDN 加速域名，如 http://cdn.example.com
  zone: process.env.QINIU_ZONE || 'Zone_z2', // 存储区域，默认华南
  uploadDir: process.env.QINIU_UPLOAD_DIR || 'upload', // 上传目录前缀
};

console.log(config);

// 初始化认证对象
const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);

const qiniuConfig = new qiniu.conf.Config();

// 表单上传器
const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
// 上传策略（token 有效时间）
const putExtra = new qiniu.form_up.PutExtra();

// ==================== 工具函数 ====================

/** 生成唯一文件名：8 位 hash + 扩展名，带目录前缀 */
function generateKey(originalName: string): string {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(4).toString('hex'); // 8 位十六进制
  const dir = config.uploadDir.replace(/^\/+|\/+$/g, ''); // 去除首尾斜杠
  return `${dir}/${hash}${ext}`;
}

/** 获取公开访问 URL */
function getPublicUrl(key: string): string {
  if (config.domain) {
    return `${config.domain.replace(/\/$/, '')}/${key}`;
  }
  // 无自定义域名时，生成七牛默认域名
  const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时有效期
  return bucketManager.privateDownloadUrl(
    config.domain || `http://${config.bucket}.bkt.clouddn.com`,
    key,
    deadline,
  );
}

// ==================== 图片压缩 ====================

export interface CompressOptions {
  /** 是否启用压缩，默认 true */
  enabled: boolean;
  /** 最大宽度（像素），超出等比例缩小，默认 1920 */
  maxWidth: number;
  /** 输出质量 1-100，默认 80 */
  quality: number;
  /** 压缩后格式，默认 "original" 保持原类型 */
  format: 'original' | 'webp' | 'jpeg' | 'png' | 'avif';
}

const defaultCompressOptions: CompressOptions = {
  enabled: true,
  maxWidth: 1920,
  quality: 80,
  format: 'original',
};

/** 判断是否为图片类型 */
function isImageFile(mimetype: string): boolean {
  return /^image\/(jpeg|png|gif|webp|svg\+xml|avif|tiff)$/.test(mimetype);
}

/** 压缩结果 */
interface CompressResult {
  buffer: Buffer;
  extension: string; // 不含点号，如 "webp"
  size: number;
}

/** 将 sharp metadata 格式映射到输出选项 */
function mapOriginalFormat(fmt: string | undefined): 'jpeg' | 'png' | 'webp' | 'avif' | null {
  switch (fmt) {
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    default:
      return null; // gif/tiff/svg 等不转换格式，只缩放
  }
}

/**
 * 压缩图片 Buffer
 * - 等比例缩放到 maxWidth 以内
 * - 默认为 "original"，保持原格式只做缩放+质量压缩
 * - 调节质量
 */
async function compressImage(
  buffer: Buffer,
  options: CompressOptions = defaultCompressOptions,
): Promise<CompressResult> {
  if (!options.enabled) {
    return { buffer, extension: '', size: buffer.length };
  }

  let pipeline = sharp(buffer).rotate(); // 自动纠正 EXIF 旋转

  // 获取原图信息
  const metadata = await pipeline.metadata();

  // 决定输出格式
  const outputFormat =
    options.format === 'original' ? mapOriginalFormat(metadata.format) : options.format;

  // 如果原格式不支持输出（如 gif），仅缩放不转换格式
  if (!outputFormat) {
    if (metadata.width && metadata.width > options.maxWidth) {
      pipeline = pipeline.resize({ width: options.maxWidth, withoutEnlargement: true });
    }
    const compressed = await pipeline.toBuffer();
    return { buffer: compressed, extension: '', size: compressed.length };
  }

  // 缩放
  if (metadata.width && metadata.width > options.maxWidth) {
    pipeline = pipeline.resize({ width: options.maxWidth, withoutEnlargement: true });
  }

  // 格式转换 + 质量
  switch (outputFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: options.quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality: options.quality, compressionLevel: 9 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: options.quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: options.quality });
      break;
  }

  const compressed = await pipeline.toBuffer();
  return {
    buffer: compressed,
    extension: options.format === 'original' ? '' : options.format,
    size: compressed.length,
  };
}

// ==================== 核心方法 ====================

/**
 * 上传单个文件 Buffer 到七牛
 */
function uploadBuffer(
  key: string,
  buffer: Buffer,
): Promise<{ key: string; url: string; hash: string }> {
  return new Promise((resolve, reject) => {
    // 生成上传 token
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: `${config.bucket}:${key}`,
      expires: 3600,
    });
    const uploadToken = putPolicy.uploadToken(mac);

    formUploader.put(uploadToken, key, buffer, putExtra, (err, respBody, respInfo) => {
      if (err) {
        return reject(err);
      }
      if (respInfo.statusCode === 200) {
        resolve({
          key: respBody.key,
          url: getPublicUrl(respBody.key),
          hash: respBody.hash,
        });
      } else {
        reject(new Error(`七牛上传失败: ${respInfo.statusCode} ${JSON.stringify(respBody)}`));
      }
    });
  });
}

// ==================== 导出接口 ====================

export interface UploadResult {
  /** 原始文件名 */
  originalName: string;
  /** 七牛存储 key */
  key: string;
  /** 公开访问 URL */
  url: string;
  /** 文件 hash */
  hash: string;
  /** 文件大小（字节） */
  size: number;
}

export interface BatchUploadResult {
  code: number;
  data: {
    /** 成功上传列表 */
    success: UploadResult[];
    /** 失败上传列表 */
    failed: { originalName: string; error: string }[];
  };
}

/**
 * 批量上传文件到七牛（图片自动压缩）
 * @param files - 文件数组
 * @param compress - 压缩选项，默认启用
 * @returns 批量上传结果
 */
export async function batchUpload(
  files: Array<{ buffer: Buffer; originalname: string; size: number; mimetype?: string }>,
  compress?: Partial<CompressOptions>,
): Promise<BatchUploadResult> {
  const compressOpts: CompressOptions = { ...defaultCompressOptions, ...compress };
  const success: UploadResult[] = [];
  const failed: { originalName: string; error: string }[] = [];

  // 并发上传（限制并发数 5）
  const concurrency = 5;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(async (file) => {
        let buffer = file.buffer;
        let key = generateKey(file.originalname);

        // 如果是图片，先压缩
        if (file.mimetype && isImageFile(file.mimetype)) {
          try {
            const compressed = await compressImage(file.buffer, compressOpts);
            buffer = compressed.buffer;
            // 压缩后扩展名可能变化，更新 key
            if (compressed.extension) {
              key = key.replace(/\.[^.]+$/, `.${compressed.extension}`);
            }
          } catch {
            // 压缩失败则用原图上传
          }
        }

        const result = await uploadBuffer(key, buffer);
        return {
          originalName: file.originalname,
          key: result.key,
          url: result.url,
          hash: result.hash,
          size: buffer.length,
        } as UploadResult;
      }),
    );

    results.forEach((r, idx) => {
      const file = batch[idx];
      if (r.status === 'fulfilled') {
        success.push(r.value);
      } else {
        failed.push({
          originalName: file.originalname,
          error: r.reason instanceof Error ? r.reason.message : String(r.reason),
        });
      }
    });
  }

  return {
    code: 0,
    data: { success, failed },
  };
}
