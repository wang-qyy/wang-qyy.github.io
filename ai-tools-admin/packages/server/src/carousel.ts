import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ==================== 类型定义 ====================

export interface CarouselPreview {
  desc: string;
  img: string;
  imgType?: number;
}

export interface CarouselDemo {
  previews: CarouselPreview[];
  params: {
    prompt: string;
  };
}

export interface CarouselItem {
  id: number;
  category: string;
  title: string;
  demos: CarouselDemo[];
  createdAt: number;
  updatedAt: number;
}

// ==================== 文件路径 ====================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const CAROUSEL_FILE = path.join(DATA_DIR, 'carousel.json');

// ==================== 辅助函数 ====================

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CAROUSEL_FILE)) {
    fs.writeFileSync(CAROUSEL_FILE, '[]', 'utf-8');
  }
}

function readAll(): CarouselItem[] {
  ensureFile();
  const raw = fs.readFileSync(CAROUSEL_FILE, 'utf-8');
  try {
    return JSON.parse(raw) as CarouselItem[];
  } catch {
    return [];
  }
}

function writeAll(items: CarouselItem[]): void {
  ensureFile();
  fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

// ==================== 公共接口 ====================

/** 获取全部轮播项（可选按 category 筛选） */
export function getAll(category?: string): CarouselItem[] {
  const all = readAll();
  if (category) {
    return all.filter((item) => item.category === category);
  }
  return all;
}

/** 根据 ID 查找 */
export function findById(id: number): CarouselItem | undefined {
  return readAll().find((item) => item.id === id);
}

/** 生成新 ID */
export function nextId(): number {
  const all = readAll();
  if (all.length === 0) return 1;
  return Math.max(...all.map((item) => item.id)) + 1;
}

/** 新增 */
export function create(
  input: Pick<CarouselItem, 'category' | 'title' | 'demos'>,
): CarouselItem {
  const all = readAll();
  const now = Date.now();
  const item: CarouselItem = {
    id: nextId(),
    category: input.category,
    title: input.title,
    demos: input.demos,
    createdAt: now,
    updatedAt: now,
  };
  all.push(item);
  writeAll(all);
  return item;
}

/** 更新 */
export function update(
  id: number,
  input: Partial<Pick<CarouselItem, 'category' | 'title' | 'demos'>>,
): CarouselItem | null {
  const all = readAll();
  const idx = all.findIndex((item) => item.id === id);
  if (idx === -1) return null;

  const existing = all[idx];
  const updated: CarouselItem = {
    ...existing,
    ...input,
    updatedAt: Date.now(),
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

/** 删除 */
export function remove(id: number): boolean {
  const all = readAll();
  const idx = all.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  writeAll(all);
  return true;
}
