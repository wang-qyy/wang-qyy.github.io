export interface AeaKwKsP {
  x: { a: number; k: number[] };
  y: { a: number; k: number[] };
  z: { a: number; k: number[] };
}

export interface AeaKwKsK {
  a: number;
  k: number[];
}

export interface AeAKw {
  ip: number;
  ks: {
    a: AeaKwKsK;
    o: AeaKwKsK;
    p: AeaKwKsP;
    r: AeaKwKsK;
    s: AeaKwKsK | AeaKwKsP;
  };
  op: number;
}
export interface AnimationInfo {
  scale: number;
  // 元素的驻场持续时间
  stay: number;
}
export interface AeAItem {
  kw: AeAKw;
  pbr: number;
  loop?: boolean;
  resId: string;
}

export type AeaItemKey = keyof AeA;

export interface AeA {
  i: AeAItem;
  o: AeAItem;
  s: AeAItem;
}
