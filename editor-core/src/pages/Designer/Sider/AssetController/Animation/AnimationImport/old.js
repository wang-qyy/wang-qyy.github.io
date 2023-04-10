/**
 * 如果存在 keyFrame.ti keyFrame.to 时, keyFrame.i.x 是 number 需要统一成 []
 * @param {{i: {x: number,y: number}, o: {x: number,y: number}}} keyFrame
 */
const formatIO = keyFrame => {
  if (keyFrame.i && typeof keyFrame.i.x === 'number') {
    keyFrame.i.x = [keyFrame.i.x];
    keyFrame.i.y = [keyFrame.i.y];
    keyFrame.o.x = [keyFrame.o.x];
    keyFrame.o.y = [keyFrame.o.y];
  }
};
const transFormPosition = (position, screenScale) => {
  let maxFrames = 1;
  let p;
  if (position.a === 0) {
    p = {
      x: {
        a: 0,
        k: [position.k[0] * screenScale],
      },
      y: {
        a: 0,
        k: [position.k[1] * screenScale],
      },
      z: {
        a: 0,
        k: [position.k[2] * screenScale],
      },
    };
  }
  if (position.a === 1) {
    p = {
      x: {
        a: 1,
        k: [],
      },
      y: {
        a: 1,
        k: [],
      },
      z: {
        a: 1,
        k: [],
      },
    };
    position.k.forEach(i => {
      i.t = Math.round(i.t);
      maxFrames = Math.max(i.t, maxFrames);
      i.s.forEach(j => (j *= screenScale));
      formatIO(i);
      p.x.k.push({ t: i.t, s: [i.s[0]], ...(i.i ? { i: i.i, o: i.o } : {}) });
      p.y.k.push({ t: i.t, s: [i.s[1]], ...(i.i ? { i: i.i, o: i.o } : {}) });
      p.z.k.push({ t: i.t, s: [i.s[2]], ...(i.i ? { i: i.i, o: i.o } : {}) });
    });
  }
  if (position.s === true || (position.x && position.y && position.z)) {
    p = {
      x: {
        a: position.x.a,
        k:
          position.x.a === 0
            ? [position.x.k * screenScale]
            : position.x.k.map(i => {
              i.t = Math.round(i.t);
              maxFrames = Math.max(i.t, maxFrames);
              formatIO(i);
              return {
                t: i.t,
                s: [i.s[0] * screenScale],
                ...(i.i ? { i: i.i, o: i.o } : {}),
              };
            }),
      },
      y: {
        a: position.y.a,
        k:
          position.y.a === 0
            ? [position.y.k * screenScale]
            : position.y.k.map(i => {
              i.t = Math.round(i.t);
              maxFrames = Math.max(i.t, maxFrames);
              formatIO(i);
              return {
                t: i.t,
                s: [i.s[0] * screenScale],
                ...(i.i ? { i: i.i, o: i.o } : {}),
              };
            }),
      },
      z: {
        a: position.z ? position.z.a : 0,
        k: position.z
          ? position.z.a === 0
            ? [position.z.k * screenScale]
            : position.z.k.map(i => {
              i.t = Math.round(i.t);
              maxFrames = Math.max(i.t, maxFrames);
              formatIO(i);
              return {
                t: i.t,
                s: [i.s[0] * screenScale],
                ...(i.i ? { i: i.i, o: i.o } : {}),
              };
            })
          : [],
      },
    };
  }
  return { maxFrames, p };
};
export const transformLayer = (layer, screenScale) => {
  let totalFrames = 1; // 至少产生一帧样式，用来设置一些没有变化的效果，如 opacity, rotate
  const ks = {
    o: {
      a: layer.ks.o.a, // 是否开启 opacity
      k:
        layer.ks.o.a === 0
          ? [layer.ks.o.k] // 转化成数组 方便计算帧样式
          : layer.ks.o.k.map(i => {
            i.t = Math.round(i.t);
            totalFrames = Math.max(i.t, totalFrames);
            formatIO(i);
            return {
              t: i.t,
              s: i.s,
              ...(i.i ? { i: i.i, o: i.o } : {}),
            };
          }),
    },
    r: {
      a: layer.ks.r.a, // 是否开启 rotate
      k:
        layer.ks.r.a === 0
          ? [layer.ks.r.k] // 转化成数组 方便计算帧样式
          : layer.ks.r.k.map(i => {
            i.t = Math.round(i.t);
            totalFrames = Math.max(i.t, totalFrames);
            formatIO(i);
            return {
              t: i.t,
              s: i.s,
              ...(i.i ? { i: i.i, o: i.o } : {}),
            };
          }),
    },
    p: (() => {
      // translate
      const { maxFrames, p } = transFormPosition(layer.ks.p, screenScale);
      totalFrames = Math.max(maxFrames, totalFrames);
      return p;
    })(),
    a: {
      a: layer.ks.a.a, // 是否开启 transform origin
      k:
        layer.ks.a.a === 0
          ? layer.ks.a.k.map(i => 0)
          : layer.ks.a.k.map(i => {
            i.t = Math.round(i.t);
            totalFrames = Math.max(i.t, totalFrames);
            i.s.forEach(j => (j *= screenScale));
            formatIO(i);
            return {
              t: i.t,
              s: i.s,
              ...(i.i ? { i: i.i, o: i.o } : {}),
            };
          }),
    },
    s: {
      a: layer.ks.s.a, // 是否开启 scale
      k:
        layer.ks.s.a === 0
          ? layer.ks.s.k
          : layer.ks.s.k.map(i => {
            i.t = Math.round(i.t);
            totalFrames = Math.max(i.t, totalFrames);
            formatIO(i);
            return {
              t: i.t,
              s: i.s,
              ...(i.i ? { i: i.i, o: i.o } : {}),
            };
          }),
    },
  };
  return { totalFrames, ks };
};
