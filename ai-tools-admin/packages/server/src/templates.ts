import fs from 'node:fs';
import path from 'node:path';

// ==================== 类型定义 ====================

export interface TemplateImage {
  url: string;
  imgType: number; // 0=搭配图, 1=参考图, 2=模特图
}

export interface TaskConfig {
  images: TemplateImage[];
}

export interface TemplateParams {
  prompt: string;
  taskConfig: TaskConfig;
}

export interface Template {
  id: number;
  category: string; // 模版分类：'1'~'73'
  preview: string;
  params: TemplateParams;
  createdAt: number;
  updatedAt: number;
}

/** 创建/更新时的输入（不包含 id 和时间戳） */
export type TemplateInput = Pick<Template, 'category' | 'preview' | 'params'>;

// ==================== 文件路径 ====================

const DATA_DIR = path.resolve(process.cwd(), 'data');
const TEMPLATES_DIR = path.join(DATA_DIR, 'templates');

// ==================== 工具函数 ====================

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** 分类 → 文件路径 */
function categoryFile(category: string): string {
  ensureDir(TEMPLATES_DIR);
  return path.join(TEMPLATES_DIR, `${category}.json`);
}

/** 读取单个分类文件 */
function readCategory(category: string): Template[] {
  const file = categoryFile(category);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw) as Template[];
  } catch {
    return [];
  }
}

/** 写入单个分类文件 */
function writeCategory(category: string, templates: Template[]): void {
  ensureDir(TEMPLATES_DIR);
  fs.writeFileSync(categoryFile(category), JSON.stringify(templates, null, 2), 'utf-8');
}

/** 扫描所有分类文件 */
function listCategoryFiles(): string[] {
  ensureDir(TEMPLATES_DIR);
  try {
    return fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}

/** 读取全部模板（合并所有分类） */
function readAll(): Template[] {
  const categories = listCategoryFiles();
  const all: Template[] = [];
  for (const cat of categories) {
    all.push(...readCategory(cat));
  }
  return all;
}

/** 在全部模板中按 ID 查找，同时返回所属分类 */
function findById(id: number): { template: Template; category: string } | null {
  const categories = listCategoryFiles();
  for (const cat of categories) {
    const list = readCategory(cat);
    const found = list.find((t) => t.id === id);
    if (found) return { template: found, category: cat };
  }
  return null;
}

/** 全局自增 ID（跨所有分类） */
function nextId(): number {
  const all = readAll();
  if (all.length === 0) return 1;
  return Math.max(...all.map((t) => t.id)) + 1;
}

// ==================== CRUD 操作 ====================

/** 获取全部模板（可选按 category 筛选） */
export function getAll(category?: string): Template[] {
  if (category) {
    return readCategory(category);
  }
  return readAll();
}

/** 按 ID 获取单个模板 */
export function getById(id: number): Template | undefined {
  return findById(id)?.template;
}

/** 新建模板 */
export function create(input: TemplateInput): Template {
  const now = Date.now();
  const template: Template = {
    id: nextId(),
    category: input.category,
    preview: input.preview,
    params: input.params,
    createdAt: now,
    updatedAt: now,
  };

  const list = readCategory(input.category);
  list.push(template);
  writeCategory(input.category, list);

  return template;
}

/** 更新模板 */
export function update(id: number, input: TemplateInput): Template | null {
  const found = findById(id);
  if (!found) return null;

  const oldCategory = found.category;

  // 如果分类改变了，从旧分类删除，写入新分类
  if (input.category !== oldCategory) {
    const oldList = readCategory(oldCategory);
    const idx = oldList.findIndex((t) => t.id === id);
    if (idx !== -1) oldList.splice(idx, 1);
    writeCategory(oldCategory, oldList);

    const newList = readCategory(input.category);
    const updated: Template = {
      ...found.template,
      category: input.category,
      preview: input.preview,
      params: input.params,
      updatedAt: Date.now(),
    };
    newList.push(updated);
    writeCategory(input.category, newList);
    return updated;
  }

  // 分类不变，原地更新
  const list = readCategory(input.category);
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  list[idx] = {
    ...list[idx],
    preview: input.preview,
    params: input.params,
    updatedAt: Date.now(),
  };
  writeCategory(input.category, list);

  return list[idx];
}

/** 删除模板 */
export function remove(id: number): boolean {
  const found = findById(id);
  if (!found) return false;

  const list = readCategory(found.category);
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  list.splice(idx, 1);
  writeCategory(found.category, list);
  return true;
}

/**
 * 批量同步某个分类的全部模板（全量替换）
 * 客户端传入的 items 不含 createdAt/updatedAt，由服务端自动补齐
 */
export function syncCategory(
  category: string,
  items: Array<{
    id: number;
    cid?: string;
    category: string;
    preview: string;
    params: TemplateParams;
  }>,
): Template[] {
  const now = Date.now();
  const templates: Template[] = items.map((item) => {
    // 保留已有模板的时间戳，新模板自动生成
    const existing = readCategory(category).find((t) => t.id === item.id);
    return {
      id: item.id,
      category: String(item.category),
      preview: item.preview,
      params: item.params,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    } as Template & { cid?: string };
  });
  writeCategory(category, templates);
  return templates;
}
