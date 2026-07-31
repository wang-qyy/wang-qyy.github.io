import fs from 'node:fs';
import path from 'node:path';

// ==================== 类型定义 ====================

/** 与 /data/templates/{category}.json 结构一致，额外增加 showInHome 字段 */
export interface TemplateImage {
  url: string;
  imgType: number;
}

export interface TaskConfig {
  images: TemplateImage[];
}

export interface TemplateParams {
  prompt: string;
  taskConfig: TaskConfig;
}

export interface HomeTempItem {
  id: number;
  category: string;
  preview: string;
  params: TemplateParams;
  showInHome: boolean;
  createdAt: number;
  updatedAt: number;
}

// ==================== 文件路径 ====================

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'home-temp.json');

// ==================== 工具函数 ====================

function read(): HomeTempItem[] {
  if (!fs.existsSync(FILE_PATH)) return [];
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw) as HomeTempItem[];
  } catch {
    return [];
  }
}

function write(items: HomeTempItem[]): void {
  fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

// ==================== CRUD 操作 ====================

/** 获取全部首页展示模板 */
export function getAll(): HomeTempItem[] {
  return read();
}

/** 添加模板到首页展示（完整模板数据 + showInHome） */
export function add(item: Omit<HomeTempItem, 'showInHome'> & { showInHome?: boolean }): HomeTempItem {
  const items = read();
  const existing = items.find((i) => i.id === item.id);
  const showInHome = item.showInHome ?? true;

  if (existing) {
    // 已存在则全量更新（保持原有 createdAt，更新其他字段）
    existing.category = item.category;
    existing.preview = item.preview;
    existing.params = item.params;
    existing.showInHome = showInHome;
    existing.updatedAt = Date.now();
    write(items);
    return existing;
  }

  const newItem: HomeTempItem = {
    id: item.id,
    category: item.category,
    preview: item.preview,
    params: item.params,
    showInHome,
    createdAt: item.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  items.push(newItem);
  write(items);
  return newItem;
}

/** 从首页展示移除模板 */
export function remove(templateId: number): boolean {
  const items = read();
  const idx = items.findIndex((i) => i.id === templateId);
  if (idx === -1) return false;
  items.splice(idx, 1);
  write(items);
  return true;
}

/** 切换模板的 showInHome 状态 */
export function toggleShow(templateId: number): HomeTempItem | null {
  const items = read();
  const item = items.find((i) => i.id === templateId);
  if (!item) return null;
  item.showInHome = !item.showInHome;
  item.updatedAt = Date.now();
  write(items);
  return item;
}

/** 获取所有 showInHome === true 的模板 ID 集合 */
export function getHomeIds(): Set<number> {
  return new Set(read().filter((i) => i.showInHome).map((i) => i.id));
}
