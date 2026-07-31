import 'dotenv/config'; // 自动加载 .env，必须放在最顶部

import cors from '@koa/cors';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';

import * as menuStore from './menus.js';
import * as carouselStore from './carousel.js';
import { batchUpload } from './qiniu.js';
import * as templateStore from './templates.js';
import * as uploadRuleStore from './upload-rules.js';
import * as homeTempStore from './home-temp.js';

const app = new Koa();
const router = new Router();

// ==================== 中间件 ====================
app.use(cors());

// koa-body：统一处理 JSON 请求体 + 文件上传
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 50 * 1024 * 1024, // 单文件最大 50MB
      maxFiles: 20, // 最多 20 个文件
      maxFieldsSize: 10 * 1024 * 1024,
      filter(part) {
        // 允许常见文件类型
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/avif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'application/zip',
          'application/x-rar-compressed',
          'video/mp4',
          'audio/mpeg',
        ];
        if (part.mimetype && allowedMimes.includes(part.mimetype)) {
          return true;
        }
        return false;
      },
    },
  }),
);

// ==================== 路由 ====================

// 健康检查
router.get('/api/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
  };
});

// 示例：获取用户列表
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

router.get('/api/users', (ctx) => {
  ctx.body = {
    code: 0,
    data: users,
  };
});

// 示例：获取单个用户
router.get('/api/users/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '用户不存在' };
    return;
  }

  ctx.body = { code: 0, data: user };
});

// 示例：创建用户
router.post('/api/users', (ctx) => {
  const body = ctx.request.body as { name?: string; email?: string };

  if (!body.name || !body.email) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'name 和 email 为必填项' };
    return;
  }

  const newUser: User = {
    id: users.length + 1,
    name: body.name,
    email: body.email,
  };
  users.push(newUser);

  ctx.status = 201;
  ctx.body = { code: 0, data: newUser };
});

// 示例：删除用户
router.delete('/api/users/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '用户不存在' };
    return;
  }

  users.splice(index, 1);
  ctx.body = { code: 0, message: '删除成功' };
});

// ==================== 文件上传 ====================

// formidable 文件类型（koa-body 底层使用 formidable）
interface FormidableFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

// 批量上传到七牛
router.post('/api/upload/batch', async (ctx) => {
  const rawFiles = ctx.request.files?.files;

  // 统一为数组
  const fileList: FormidableFile[] = rawFiles
    ? Array.isArray(rawFiles)
      ? rawFiles
      : [rawFiles]
    : [];

  if (fileList.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请至少选择一个文件' };
    return;
  }

  // 检查七牛配置
  if (!process.env.QINIU_ACCESS_KEY || !process.env.QINIU_BUCKET) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '七牛云未配置，请设置 QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET 环境变量',
    };
    return;
  }

  try {
    // 读取文件为 Buffer
    const fs = await import('node:fs/promises');
    const filesForUpload = await Promise.all(
      fileList.map(async (f) => ({
        buffer: await fs.readFile(f.filepath),
        originalname: f.originalFilename || 'unknown',
        size: f.size,
        mimetype: f.mimetype,
      })),
    );

    const result = await batchUpload(filesForUpload);
    ctx.body = result;
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { code: 500, message: err.message || '上传失败' };
  }
});

// 单文件上传到七牛
router.post('/api/upload/single', async (ctx) => {
  const rawFile = ctx.request.files?.file;
  const file: FormidableFile | undefined = Array.isArray(rawFile) ? rawFile[0] : rawFile;

  if (!file) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请选择一个文件' };
    return;
  }

  if (!process.env.QINIU_ACCESS_KEY || !process.env.QINIU_BUCKET) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '七牛云未配置，请设置 QINIU_ACCESS_KEY / QINIU_SECRET_KEY / QINIU_BUCKET 环境变量',
    };
    return;
  }

  try {
    const fs = await import('node:fs/promises');
    const buffer = await fs.readFile(file.filepath);

    const result = await batchUpload([
      {
        buffer,
        originalname: file.originalFilename || 'unknown',
        size: file.size,
        mimetype: file.mimetype,
      },
    ]);

    const uploaded = result.data.success[0];
    if (uploaded) {
      ctx.body = { code: 0, data: uploaded };
    } else {
      ctx.status = 500;
      ctx.body = { code: 500, message: result.data.failed[0]?.error || '上传失败' };
    }
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { code: 500, message: err.message || '上传失败' };
  }
});

// ==================== 模版管理 CRUD ====================

/**
 * GET /api/templates
 * 获取全部模板列表，支持按 category 筛选
 * 查询参数: ?category=1
 */
router.get('/api/templates', (ctx) => {
  const category = ctx.query.category as string | undefined;
  const templates = templateStore.getAll(category);
  ctx.body = { code: 0, data: templates };
});

/**
 * GET /api/templates/:id
 * 获取单个模板详情
 */
router.get('/api/templates/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const template = templateStore.getById(id);
  if (!template) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '模版不存在' };
    return;
  }
  ctx.body = { code: 0, data: template };
});

/**
 * POST /api/templates
 * 创建模板
 * Body: { category, preview, params: { prompt, taskConfig: { images } } }
 */
router.post('/api/templates', (ctx) => {
  const body = ctx.request.body as {
    category?: string;
    preview?: string;
    params?: { prompt?: string; taskConfig?: { images?: { url: string; imgType: number }[] } };
  };

  if (!body.category) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'category 为必填项' };
    return;
  }
  if (!body.preview) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'preview 为必填项' };
    return;
  }
  if (!body.params?.prompt) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'params.prompt 为必填项' };
    return;
  }
  if (!body.params?.taskConfig?.images || body.params.taskConfig.images.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '至少需要一张素材图片' };
    return;
  }

  const template = templateStore.create({
    category: body.category,
    preview: body.preview,
    params: {
      prompt: body.params.prompt,
      taskConfig: { images: body.params.taskConfig.images },
    },
  });

  ctx.status = 201;
  ctx.body = { code: 0, data: template };
});

/**
 * PUT /api/templates/:id
 * 更新模板
 */
router.put('/api/templates/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const body = ctx.request.body as {
    category?: string;
    preview?: string;
    params?: { prompt?: string; taskConfig?: { images?: { url: string; imgType: number }[] } };
  };

  if (!body.category) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'category 为必填项' };
    return;
  }
  if (!body.preview) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'preview 为必填项' };
    return;
  }
  if (!body.params?.prompt) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'params.prompt 为必填项' };
    return;
  }
  if (!body.params?.taskConfig?.images || body.params.taskConfig.images.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '至少需要一张素材图片' };
    return;
  }

  const template = templateStore.update(id, {
    category: body.category,
    preview: body.preview,
    params: {
      prompt: body.params.prompt,
      taskConfig: { images: body.params.taskConfig.images },
    },
  });

  if (!template) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '模版不存在' };
    return;
  }

  ctx.body = { code: 0, data: template };
});

/**
 * DELETE /api/templates/:id
 * 删除模板
 */
router.delete('/api/templates/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const success = templateStore.remove(id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '模版不存在' };
    return;
  }
  ctx.body = { code: 0, message: '删除成功' };
});

/**
 * POST /api/templates/sync-category
 * 批量同步某个分类的全部模板（全量替换）
 * Body: { category: string, items: Template[] }
 */
router.post('/api/templates/sync-category', (ctx) => {
  const body = ctx.request.body as {
    category?: string;
    items?: Array<{
      id: number;
      cid?: string;
      category: string;
      preview: string;
      params: { prompt: string; taskConfig: { images: Array<{ url: string; imgType: number }> } };
    }>;
  } | undefined;

  if (!body?.category || !body?.items || !Array.isArray(body.items)) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少 category 或 items 参数' };
    return;
  }

  const result = templateStore.syncCategory(body.category, body.items);
  ctx.body = { code: 0, data: result, message: `已同步 ${result.length} 条模板` };
});

// ==================== 上传规则管理 CRUD ====================

/**
 * GET /api/upload-rules
 * 获取全部上传规则，支持按 category 筛选
 * 查询参数: ?category=1
 */
router.get('/api/upload-rules', (ctx) => {
  const category = ctx.query.category as string | undefined;
  const rules = uploadRuleStore.readAll(category);
  ctx.body = { code: 0, data: rules };
});

/**
 * GET /api/upload-rules/categories
 * 获取所有上传规则分类列表
 */
router.get('/api/upload-rules/categories', (ctx) => {
  const categories = uploadRuleStore.getCategories();
  ctx.body = { code: 0, data: categories };
});

/**
 * POST /api/upload-rules
 * 创建上传规则
 */
router.post('/api/upload-rules', (ctx) => {
  const body = ctx.request.body as {
    category?: string;
    right?: {
      desc?: string;
      params?: {
        prompt?: string;
        taskConfig?: { images?: { url: string; imgType: number }[] };
      };
    }[];
    wrong?: { url: string; desc: string }[];
  };

  if (!body.category) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'category 为必填项' };
    return;
  }
  if (!body.right || body.right.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'right 数组不能为空' };
    return;
  }
  for (let i = 0; i < body.right.length; i++) {
    const r = body.right[i];
    if (!r.desc) {
      ctx.status = 400;
      ctx.body = { code: 400, message: `right[${i}].desc 为必填项` };
      return;
    }
    if (!r.params?.taskConfig?.images || r.params.taskConfig.images.length === 0) {
      ctx.status = 400;
      ctx.body = { code: 400, message: `right[${i}] 至少需要一张图片` };
      return;
    }
    const hasCommodityImage = r.params.taskConfig.images.some((img) => img.imgType === 0);
    if (!hasCommodityImage) {
      ctx.status = 400;
      ctx.body = { code: 400, message: `right[${i}] 至少需要上传一张商品图 (imgType = 0)` };
      return;
    }
  }

  const rule = uploadRuleStore.create(body.category, {
    category: body.category,
    right: body.right.map((r) => ({
      desc: r.desc!,
      prodInfo: (r as any).prodInfo,
      params: {
        prompt: r.params?.prompt || '',
        taskConfig: { images: r.params!.taskConfig!.images! },
      },
    })),
    wrong: body.wrong || [],
  });

  ctx.status = 201;
  ctx.body = { code: 0, data: rule };
});

/**
 * PUT /api/upload-rules/:category/:id
 * 更新上传规则
 */
router.put('/api/upload-rules/:category/:id', (ctx) => {
  const category = ctx.params.category;
  const id = Number(ctx.params.id);
  const body = ctx.request.body as {
    category?: string;
    right?: {
      desc?: string;
      params?: {
        prompt?: string;
        taskConfig?: { images?: { url: string; imgType: number }[] };
      };
    }[];
    wrong?: { url: string; desc: string }[];
  };

  if (!body.category) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'category 为必填项' };
    return;
  }
  if (!body.right || body.right.length === 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'right 数组不能为空' };
    return;
  }
  for (let i = 0; i < body.right.length; i++) {
    const r = body.right[i];
    if (!r.desc) {
      ctx.status = 400;
      ctx.body = { code: 400, message: `right[${i}].desc 为必填项` };
      return;
    }
    if (!r.params?.taskConfig?.images || r.params.taskConfig.images.length === 0) {
      ctx.status = 400;
      ctx.body = { code: 400, message: `right[${i}] 至少需要一张图片` };
      return;
    }
    const hasCommodityImage = r.params.taskConfig.images.some((img) => img.imgType === 0);
    if (!hasCommodityImage) {
      ctx.status = 400;
      ctx.body = { code: 400, message: `right[${i}] 至少需要上传一张商品图 (imgType = 0)` };
      return;
    }
  }

  const rule = uploadRuleStore.update(category, id, {
    category: body.category,
    right: body.right.map((r) => ({
      desc: r.desc!,
      prodInfo: (r as any).prodInfo,
      params: {
        prompt: r.params?.prompt || '',
        taskConfig: { images: r.params!.taskConfig!.images! },
      },
    })),
    wrong: body.wrong || [],
  });

  if (!rule) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '上传规则不存在' };
    return;
  }

  ctx.body = { code: 0, data: rule };
});

/**
 * DELETE /api/upload-rules/:category/:id
 * 删除上传规则
 */
router.delete('/api/upload-rules/:category/:id', (ctx) => {
  const category = ctx.params.category;
  const id = Number(ctx.params.id);
  const success = uploadRuleStore.remove(category, id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '上传规则不存在' };
    return;
  }
  ctx.body = { code: 0, message: '删除成功' };
});

/**
 * GET /api/upload-rules/export
 * 导出全部上传规则（新格式，含 categoryName）
 */
router.get('/api/upload-rules/export', (ctx) => {
  const data = uploadRuleStore.exportAll();
  ctx.body = { code: 0, data };
});

/**
 * POST /api/upload-rules/save-all
 * 将全部规则保存为合并 JSON 文件到服务端
 */
router.post('/api/upload-rules/save-all', (ctx) => {
  const data = uploadRuleStore.exportAll();
  ctx.body = {
    code: 0,
    message: '已保存到服务端',
    data: {
      totalRules: data.totalRules,
      categories: data.rules.reduce((acc, r) => {
        if (!acc.includes(r.category)) acc.push(r.category);
        return acc;
      }, [] as string[]),
    },
  };
});

// ==================== 菜单管理 CRUD ====================

/**
 * GET /api/menus
 * 获取全部菜单
 */
router.get('/api/menus', (ctx) => {
  const menus = menuStore.getAll();
  ctx.body = { code: 0, data: menus };
});

/**
 * PUT /api/menus
 * 保存全部菜单（全量替换）
 * Body: MenuGroup[]
 */
router.put('/api/menus', (ctx) => {
  const body = ctx.request.body as menuStore.MenuGroup[] | undefined;

  if (!body || !Array.isArray(body)) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请求体必须为数组' };
    return;
  }

  const result = menuStore.saveAll(body);
  ctx.body = { code: 0, data: result, message: '保存成功' };
});

/**
 * PATCH /api/menus/:groupId/:itemId/toggle
 * 切换菜单项上下线状态
 * Body: { status: 'online' | 'offline' }
 */
router.patch('/api/menus/:groupId/:itemId/toggle', (ctx) => {
  const { groupId, itemId } = ctx.params as { groupId: string; itemId: string };
  const { status } = ctx.request.body as { status?: string } | undefined;

  if (!status || (status !== 'online' && status !== 'offline')) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'status 必须为 online 或 offline' };
    return;
  }

  const item = menuStore.toggleItemStatus(groupId, itemId, status);
  if (!item) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '菜单项不存在' };
    return;
  }

  ctx.body = { code: 0, data: item, message: `已${status === 'online' ? '上线' : '下线'}` };
});

// ==================== 轮播图管理 ====================

/**
 * GET /api/carousel?category=xxx
 * 获取轮播图列表（可选按 category 筛选）
 */
router.get('/api/carousel', (ctx) => {
  const category = ctx.query.category as string | undefined;
  const data = carouselStore.getAll(category);
  ctx.body = { code: 0, data };
});

/**
 * POST /api/carousel
 * 新增轮播图
 * Body: { category, title, demos }
 */
router.post('/api/carousel', (ctx) => {
  const body = ctx.request.body as {
    category?: string;
    title?: string;
    demos?: carouselStore.CarouselDemo[];
  } | undefined;

  if (!body?.category || !body?.title || !body?.demos) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少必填字段：category, title, demos' };
    return;
  }
  if (!Array.isArray(body.demos)) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'demos 必须为数组' };
    return;
  }
  for (const demo of body.demos) {
    if (
      !demo.previews ||
      !Array.isArray(demo.previews) ||
      demo.previews.length < 1 ||
      demo.previews.length > 4
    ) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '每组轮播预览图数量需在 1-4 张之间' };
      return;
    }
  }

  const item = carouselStore.create({
    category: body.category,
    title: body.title,
    demos: body.demos,
  });
  ctx.status = 201;
  ctx.body = { code: 0, data: item, message: '创建成功' };
});

/**
 * PUT /api/carousel/:id
 * 更新轮播图
 */
router.put('/api/carousel/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const body = ctx.request.body as {
    category?: string;
    title?: string;
    demos?: carouselStore.CarouselDemo[];
  } | undefined;

  if (body?.demos && Array.isArray(body.demos)) {
    for (const demo of body.demos) {
      if (
        !demo.previews ||
        !Array.isArray(demo.previews) ||
        demo.previews.length < 1 ||
        demo.previews.length > 4
      ) {
        ctx.status = 400;
        ctx.body = { code: 400, message: '每组轮播预览图数量需在 1-4 张之间' };
        return;
      }
    }
  }

  const updated = carouselStore.update(id, body ?? {});
  if (!updated) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '轮播图不存在' };
    return;
  }
  ctx.body = { code: 0, data: updated, message: '更新成功' };
});

/**
 * DELETE /api/carousel/:id
 * 删除轮播图
 */
router.delete('/api/carousel/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const success = carouselStore.remove(id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '轮播图不存在' };
    return;
  }
  ctx.body = { code: 0, message: '删除成功' };
});

// ==================== 首页展示模版管理 ====================

/**
 * GET /api/home-temp
 * 获取全部首页展示模板（完整模板数据 + showInHome）
 */
router.get('/api/home-temp', (ctx) => {
  const data = homeTempStore.getAll();
  ctx.body = { code: 0, data };
});

/**
 * GET /api/home-temp/ids
 * 获取首页展示的模板 ID 集合（轻量查询，不返回完整数据）
 */
router.get('/api/home-temp/ids', (ctx) => {
  const ids = homeTempStore.getHomeIds();
  ctx.body = { code: 0, data: Array.from(ids) };
});

/**
 * POST /api/home-temp
 * 添加/更新模板到首页展示（完整模板数据 + showInHome）
 * Body: { id, category, preview, params, showInHome }
 */
router.post('/api/home-temp', (ctx) => {
  const body = ctx.request.body as
    | ({
        id?: number;
        category?: string;
        preview?: string;
        params?: homeTempStore.TemplateParams;
        showInHome?: boolean;
        createdAt?: number;
        updatedAt?: number;
      } & Record<string, unknown>)
    | undefined;

  if (!body || typeof body.id !== 'number') {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'id 为必填项' };
    return;
  }
  if (!body.category) {
    ctx.status = 400;
    ctx.body = { code: 400, message: 'category 为必填项' };
    return;
  }

  const item = homeTempStore.add({
    id: body.id,
    category: body.category,
    preview: body.preview || '',
    params: body.params || { prompt: '', taskConfig: { images: [] } },
    showInHome: body.showInHome ?? true,
    createdAt: body.createdAt ?? Date.now(),
    updatedAt: body.updatedAt ?? Date.now(),
  });

  ctx.status = 201;
  ctx.body = { code: 0, data: item, message: '已添加到首页展示' };
});

/**
 * DELETE /api/home-temp/:id
 * 从首页移除模板
 */
router.delete('/api/home-temp/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const success = homeTempStore.remove(id);
  if (!success) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '模板不在首页展示列表中' };
    return;
  }
  ctx.body = { code: 0, message: '已从首页移除' };
});

/**
 * PATCH /api/home-temp/:id/toggle
 * 切换 showInHome 状态
 */
router.patch('/api/home-temp/:id/toggle', (ctx) => {
  const id = Number(ctx.params.id);
  const item = homeTempStore.toggleShow(id);
  if (!item) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '模板不存在' };
    return;
  }
  ctx.body = {
    code: 0,
    data: item,
    message: item.showInHome ? '已设为首页展示' : '已取消首页展示',
  };
});

// ==================== 注册路由 ====================
app.use(router.routes()).use(router.allowedMethods());

// ==================== 启动服务 ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/health`);
});
