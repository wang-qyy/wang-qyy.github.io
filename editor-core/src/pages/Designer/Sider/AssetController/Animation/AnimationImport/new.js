const data = {};

const formatNumber = v => {
  return Number(v.toFixed(2));
};
const formatIO = (keyFrame, index = 0) => {
  if (keyFrame.i && Array.isArray(keyFrame.i.x)) {
    keyFrame.i = {
      s: [formatNumber(keyFrame.i.x[index]), formatNumber(keyFrame.i.y[index])],
    };
    keyFrame.o = {
      s: [formatNumber(keyFrame.o.x[index]), formatNumber(keyFrame.o.y[index])],
    };
  }
};
const drawPath = pathNodes => {
  let pathString = ` M${pathNodes.v[0][0]},${pathNodes.v[0][1]}`;
  let i;
  let len;
  len = pathNodes.v.length;
  for (i = 1; i < len; i += 1) {
    pathString += ` C${pathNodes.o[i - 1][0]},${pathNodes.o[i - 1][1]} ${
      pathNodes.i[i][0]
    },${pathNodes.i[i][1]} ${pathNodes.v[i][0]},${pathNodes.v[i][1]}`;
  }
  if (pathNodes.c && len > 1) {
    pathString += ` C${pathNodes.o[i - 1][0]},${pathNodes.o[i - 1][1]} ${
      pathNodes.i[0][0]
    },${pathNodes.i[0][1]} ${pathNodes.v[0][0]},${pathNodes.v[0][1]}`;
  }
  return pathString;
};

export const transformLayer = layer => {
  let totalFrames = 1; // 至少产生一帧样式，用来设置一些没有变化的效果，如 opacity, rotate
  const ks = {};
  const shape = layer.shapes[0];

  if (layer.td === 1) {
    ks.type = 'alphaClip';
    const points = shape.it[0].ks.k;
    let minX = 0;
    let minY = 0;
    points.v.forEach(p => {
      minX = Math.min(p[0], minX);
      minY = Math.min(p[1], minY);
    });
    points.v.forEach(p => {
      p[0] += -minX;
      p[1] += -minY;
    });
    ks.path = drawPath(points);
    return { totalFrames: 0, ks };
  }
  if (layer.ks.a.a === 1 && ['gr'].includes(shape.ty)) {
    const [w, h] = shape.it[0].s.k;
    const [tx, ty] = shape.it[3].p.k;
    ks.a = {
      k: layer.ks.a.k.map(i => {
        i.t = Math.round(i.t);
        i.s[0] = formatNumber(i.s[0]);
        totalFrames = Math.max(i.t, totalFrames);
        if (i.i) {
          i.i.x = [i.i.x];
          i.i.y = [i.i.y];
        }
        if (i.o) {
          i.o.x = [i.o.x];
          i.o.y = [i.o.y];
        }
        formatIO(i);
        return {
          t: i.t,
          s: i.s.map((v, ind) => {
            if (ind === 0) {
              return formatNumber(0.5 + (v - tx) / w) * 100;
            }
            if (ind === 1) {
              return formatNumber(0.5 + (v - ty) / h) * 100;
            }
            if (ind === 2) {
              return 0;
            }
          }),
          ...(i.i ? { i: i.i, o: i.o } : {}),
        };
      }),
    };
  }
  if (layer.ks.o.a === 1) {
    ks.o = {
      k: layer.ks.o.k.map(i => {
        i.t = Math.round(i.t);
        i.s[0] = formatNumber(i.s[0] / 100);
        totalFrames = Math.max(i.t, totalFrames);
        formatIO(i);
        return { t: i.t, s: i.s, ...(i.i ? { i: i.i, o: i.o } : {}) };
      }),
    };
  }
  if (layer.ks.r?.a === 1) {
    ks.r = {
      k: layer.ks.r.k.map(i => {
        i.t = Math.round(i.t);
        i.s[0] = formatNumber(i.s[0]);
        totalFrames = Math.max(i.t, totalFrames);
        formatIO(i);
        return { t: i.t, s: i.s, ...(i.i ? { i: i.i, o: i.o } : {}) };
      }),
    };
  }
  // if (layer.ks.rx?.a === 1) {
  //     ks.rx = {
  //         k: layer.ks.rx.k.map((i) => {
  //             i.t = Math.round(i.t);
  //             i.s[0] = formatNumber(i.s[0]);
  //             totalFrames = Math.max(i.t, totalFrames);
  //             formatIO(i);
  //             return Object.assign({ t: i.t, s: i.s }, i.i ? { i: i.i, o: i.o } : {});
  //         }),
  //     };
  // }
  // if (layer.ks.ry?.a === 1) {
  //     ks.rx = {
  //         k: layer.ks.rx.k.map((i) => {
  //             i.t = Math.round(i.t);
  //             i.s[0] = formatNumber(i.s[0]);
  //             totalFrames = Math.max(i.t, totalFrames);
  //             formatIO(i);
  //             return Object.assign({ t: i.t, s: i.s }, i.i ? { i: i.i, o: i.o } : {});
  //         }),
  //     };
  // }
  // if (layer.ks.rz?.a === 1) {
  //     ks.rx = {
  //         k: layer.ks.rx.k.map((i) => {
  //             i.t = Math.round(i.t);
  //             i.s[0] = formatNumber(i.s[0]);
  //             totalFrames = Math.max(i.t, totalFrames);
  //             formatIO(i);
  //             return Object.assign({ t: i.t, s: i.s }, i.i ? { i: i.i, o: i.o } : {});
  //         }),
  //     };
  // }
  if (layer.ks.p.a === 1) {
    const p = {
      x: {
        k: [],
      },
      y: {
        k: [],
      },
      z: {
        k: [],
      },
    };
    layer.ks.p.k.forEach(i => {
      i.t = Math.round(i.t);
      totalFrames = Math.max(i.t, totalFrames);
      if (i.i) {
        i.i.x = [i.i.x];
        i.i.y = [i.i.y];
      }
      if (i.o) {
        i.o.x = [i.o.x];
        i.o.y = [i.o.y];
      }
      formatIO(i, 0);
      console.log(i);
      p.x.k.push({
        t: i.t,
        s: [formatNumber(i.s[0])],
        ...(i.i ? { i: i.i, o: i.o } : {}),
      });
      p.y.k.push({
        t: i.t,
        s: [formatNumber(i.s[1])],
        ...(i.i ? { i: i.i, o: i.o } : {}),
      });
      if (i.s.length === 3) {
        p.z.k.push({
          t: i.t,
          s: [formatNumber(i.s[2])],
          ...(i.i ? { i: i.i, o: i.o } : {}),
        });
      }
    });
    ks.p = p;
  }
  if (layer.ks.p.s === true) {
    const p = {};
    if (layer.ks.p.x.a === 1) {
      p.x = {
        k: layer.ks.p.x.k.map(i => {
          i.t = Math.round(i.t);
          totalFrames = Math.max(i.t, totalFrames);
          formatIO(i);
          return {
            t: i.t,
            s: [formatNumber(i.s[0])],
            ...(i.i ? { i: i.i, o: i.o } : {}),
          };
        }),
      };
    }
    if (layer.ks.p.y.a === 1) {
      p.y = {
        k: layer.ks.p.y.k.map(i => {
          i.t = Math.round(i.t);
          totalFrames = Math.max(i.t, totalFrames);
          formatIO(i);
          console.log(i);
          return {
            t: i.t,
            s: [formatNumber(i.s[0])],
            ...(i.i ? { i: i.i, o: i.o } : {}),
          };
        }),
      };
    }
    if (layer.ks.p.z?.a === 1) {
      p.z = {
        k: layer.ks.p.z
          ? layer.ks.p.z.k.map(i => {
              i.t = Math.round(i.t);
              totalFrames = Math.max(i.t, totalFrames);
              formatIO(i);
              return {
                t: i.t,
                s: [formatNumber(i.s[0])],
                ...(i.i ? { i: i.i, o: i.o } : {}),
              };
            })
          : [],
      };
    }
    ks.p = p;
  }
  if (layer.ks.s.a === 1) {
    const s = {};
    s.x = {
      k: layer.ks.s.k.map(i => {
        i.t = Math.round(i.t);
        totalFrames = Math.max(i.t, totalFrames);
        const io = {};
        if (i.i) {
          io.i = {
            x: [i.i.x[0]],
            y: [i.i.y[0]],
          };
        }
        if (i.o) {
          io.o = {
            x: [i.o.x[0]],
            y: [i.o.y[0]],
          };
        }
        formatIO(io);
        return { t: i.t, s: [formatNumber(i.s[0] / 100)], ...(i.i ? io : {}) };
      }),
    };
    s.y = {
      k: layer.ks.s.k.map(i => {
        i.t = Math.round(i.t);
        totalFrames = Math.max(i.t, totalFrames);
        const io = {};
        if (i.i) {
          io.i = {
            x: [i.i.x[1]],
            y: [i.i.y[1]],
          };
        }
        if (i.o) {
          io.o = {
            x: [i.o.x[1]],
            y: [i.o.y[1]],
          };
        }
        formatIO(io);
        return { t: i.t, s: [formatNumber(i.s[1] / 100)], ...(i.i ? io : {}) };
      }),
    };
    s.z = {
      k: layer.ks.s.k.map(i => {
        i.t = Math.round(i.t);
        totalFrames = Math.max(i.t, totalFrames);
        const io = {};
        if (i.i) {
          io.i = {
            x: [i.i.x[2]],
            y: [i.i.y[2]],
          };
        }
        if (i.o) {
          io.o = {
            x: [i.o.x[2]],
            y: [i.o.y[2]],
          };
        }
        formatIO(io);
        return { t: i.t, s: [formatNumber(i.s[2] / 100)], ...(i.i ? io : {}) };
      }),
    };
    ks.s = s;
  }
  return { totalFrames, ks };
};
