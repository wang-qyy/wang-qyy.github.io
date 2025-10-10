import { useEffect } from "react";

function getIndexDBData(
  dbName: string,
  version: number,
  storeName: string,
  key: string
) {
  return new Promise((resolve, reject) => {
    // 1. 打开数据库。数据库名是 'YFT'，版本号需要根据实际情况调整（图中未显示，通常从1开始）
    const request = indexedDB.open(dbName, version);

    // 2. 定义处理成功和错误情况的函数
    request.onsuccess = function (event) {
      // 数据库打开成功，获取数据库实例
      const db = event.target.result;

      // 3. 创建一个只读事务，指定要操作的对象存储 'snapshots'
      const transaction = db.transaction([storeName], "readonly");

      // 4. 从事务中获取对象存储
      const objectStore = transaction.objectStore(storeName);

      // 5. 使用 get() 方法通过键（Key）获取单条数据
      // 键是 'APXCMQX_hz'，对应图片中的条目
      const getRequest = objectStore.get(key);

      getRequest.onsuccess = function (event) {
        // 数据获取成功！
        const data = event.target.result;
        console.log("获取到的数据：", data);

        resolve(data);
        // 此时，变量 data 就包含了图片中右侧显示的 JSON 对象
        // 您可以像操作普通 JavaScript 对象一样使用它
        // 例如：data.name, data.objects 等
      };

      getRequest.onerror = function (event) {
        console.error("获取数据时出错：", event.target.error);
      };

      // 事务结束后自动关闭数据库连接（在简单操作中常见）
      // 但对于复杂应用，可能需要手动管理 db.close()
    };

    request.onerror = function (event) {
      console.error("打开数据库失败：", event.target.error);
    };

    // 3. （可选但重要）处理数据库版本升级
    // 如果打开的版本高于当前版本，会触发 onupgradeneeded 事件
    // 这里可以创建或修改对象存储的结构
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      // 如果对象存储不存在，则创建它。如果已存在，不要重复创建。
      if (!db.objectStoreNames.contains(storeName)) {
        // 创建一个对象存储，并定义键路径（keyPath），类似于主键
        // 假设我们用 'id' 作为键路径，但根据图片，实际键名是自定义的（如'APXCMQX_hz'）
        // 如果键是自增的或具有特定路径，需要在这里定义。
        // 由于图片中键名复杂，可能不是自增id，可能需要使用 out-of-line keys。
        // 这里创建一个基本的对象存储，使用自增键。
        const objectStore = db.createObjectStore(storeName, {
          autoIncrement: true,
        });
        // 或者，如果数据对象本身有唯一标识字段（如'id'），可以指定 keyPath
        // const objectStore = db.createObjectStore(storeName, { keyPath: 'id' });
        // 根据图片数据结构，创建索引以便查询（可选）
        // objectStore.createIndex('name', 'name', { unique: false });
      }
    };
  });
}

export default () => {
  useEffect(() => {
    // getIndexDBData("YFT", 10, "snapshots", "APxCmQX_hz");
    getIndexDBData(
      "editor",
      10,
      "design_data",
      "01K741KPV5SMG6GCHQ317Q45EM"
    ).then(({ value }) => {
      console.log(JSON.parse(value));
    });
  }, []);

  return <></>;
};
