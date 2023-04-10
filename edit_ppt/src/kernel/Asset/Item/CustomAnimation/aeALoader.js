import { config } from '@kernel/utils/config';

function getAeAnimationDetail(id) {
  return fetch(
    `${config.hostName}${config.apis.getAeAnimationDetail}?id=${id}`,
    { credentials: 'include' },
  );
}

/**
 * ae 动画详情获取, 通过队列控制多次请求
 */
export default class AeALoader {
  static resources = new Map();

  static queue = new Map();

  static async get(resId, className, callback = () => {}) {
    if (this.resources.has(resId)) {
      callback(this.resources.get(resId));
    } else if (this.queue.has(resId)) {
      const q = this.queue.get(resId);
      q[className] = callback;
    } else {
      try {
        this.queue.set(resId, { [className]: callback });
        await this.fetch(resId);
        const q = this.queue.get(resId);
        const data = this.resources.get(resId);
        if (data) {
          for (const i in q) {
            q[i] && q[i](data);
          }
        }
        this.queue.set(resId, {});
      } catch (error) {
        console.error('aeA loader get error: ', error);
      }
    }
  }

  static async fetch(resId) {
    try {
      const res = await (await getAeAnimationDetail(resId)).json();
      if (res.stats === 1) {
        this.resources.set(resId, {
          cid_1: res.data.cid_1,
          cid_1_name: res.data.cid_1_name,
          cid_2: res.data.cid_2,
          cid_2_name: res.data.cid_2_name,
          id: res.data.id,
          kw: JSON.parse(res.data.json_react),
          sort: Number(res.data.sort),
          src: res.data.src, // image src
          title: res.data.title,
          type: res.data.type,
        });
      }
    } catch (error) {
      console.error('aeA loader fetch error: ', error);
    }
  }
}
