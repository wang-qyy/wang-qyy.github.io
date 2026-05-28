const list = "/api/editor/assets/stream";

export default {
  "POST /api/ai-tools/chata": (req, res) => {
    // 设置响应头，表明这是一个流式响应
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    // 模拟流式传输数据
    let index = 0;
    const sendData = () => {
      if (index < list.length) {
        // 发送单个元素作为JSON字符串
        res.write(JSON.stringify(list[index]) + "\n");
        index++;

        // 继续发送下一个数据块
        setTimeout(sendData, 100); // 每100ms发送一次，模拟网络延迟
      } else {
        // 结束响应
        res.end();
      }
    };

    // 开始发送数据
    sendData();
  },

  "GET /hostApi/api/ai-tools/chat-list": (req, res) => {
    setTimeout(() => {
      res.json({
        code: 200,
        list: [
          ...Array(4).fill({
            sign_md5: req.query.page, //
            query: "一个西瓜", // 对话第一条的输入内容
            created: "2023-05-09 16:05:09", // 创建时间
          }),
        ],
        page: Number(req.query.page),
        pageTotal: 10,
      });
    }, 1000);
  },

  // 请求参数 sign_md5
  // "GET /hostApi/api/ai-tools/chat/detail": (req, res) => {
  //   setTimeout(() => {
  //     res.json({
  //       code: 200,
  //       list: [
  //         {
  //           sign_md5: "e5da1416daf49a5aaf6d4b383b883d88", //
  //           query: "一个西瓜", // 用户输入内容
  //           style_id: 1,
  //           created_at: "2023-05-09 16:05:09", // 创建时间
  //           type: "user",
  //         },
  //         {
  //           sign_md5: "e5da1416daf49a5aaf6d4b383b883d88", //
  //           content: "夏日清凉的西瓜盛宴", // ai输出内容
  //           created_at: "2023-05-09 16:05:09", // 创建时间
  //           type: "assistant",
  //         },
  //         {
  //           sign_md5: "e5da1416daf49a5aaf6d4b383b883d88", //
  //           query: "帮我优化一下，突出西瓜的水分和甜分", // 用户输入内容
  //           style_id: 1,
  //           created_at: "2023-05-09 16:05:09", // 创建时间
  //           type: "user",
  //         },
  //         {
  //           sign_md5: "e5da1416daf49a5aaf6d4b383b883d88", //
  //           content: "多汁甜蜜西瓜", // ai输出内容
  //           created_at: "2023-05-09 16:05:09", // 创建时间
  //           type: "assistant",
  //         },
  //         {
  //           sign_md5: "e5da1416daf49a5aaf6d4b383b883d88", //
  //           content: "多汁甜蜜的西瓜诱惑", // ai输出内容
  //           created_at: "2023-05-09 16:05:09", // 创建时间
  //           type: "assistant",
  //         },
  //       ],
  //       page: 1,
  //       pageTotal: 10,
  //     });
  //   }, 1000);
  // },
};
