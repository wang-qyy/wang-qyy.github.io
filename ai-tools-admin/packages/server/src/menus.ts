import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, '../data/menus.json');

// ==================== 类型定义 ====================

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  url: string;
  preview: string;
  desc: string;
  type: string; // TEMPLATE_CATEGORIES key
  status?: 'online' | 'offline'; // 上下线状态，默认 online
}

export interface MenuGroup {
  id: string;
  name: string;
  children: MenuItem[];
}

// ==================== 内部工具 ====================

function ensureFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readAll(): MenuGroup[] {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as MenuGroup[];
}

function writeAll(data: MenuGroup[]): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ==================== CRUD 操作 ====================

/** 获取全部菜单 */
export function getAll(): MenuGroup[] {
  return readAll();
}

/** 替换全部菜单（用于批量保存） */
export function saveAll(groups: MenuGroup[]): MenuGroup[] {
  writeAll(groups);
  return readAll();
}

/** 切换菜单项上下线状态 */
export function toggleItemStatus(
  groupId: string,
  itemId: string,
  status: 'online' | 'offline',
): MenuItem | null {
  const groups = readAll();
  for (const g of groups) {
    if (g.id === groupId) {
      const item = g.children.find((c) => c.id === itemId);
      if (item) {
        item.status = status;
        writeAll(groups);
        return item;
      }
    }
  }
  return null;
}

/** 生成新 ID */
export function nextId(groups?: MenuGroup[]): string {
  const data = groups || readAll();
  let max = 0;
  for (const g of data) {
    const gid = Number(g.id);
    if (gid > max) max = gid;
    for (const child of g.children) {
      const cid = Number(child.id);
      if (cid > max) max = cid;
    }
  }
  return String(max + 1);
}
