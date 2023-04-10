/* eslint-disable */

const fs = require("fs");
const path = require("path");

const jsPath = path.join(__dirname, "../dist/js/");
const jsMapReg = /\.js\.map$/;
if (fs.existsSync(jsPath)) {
  // 返回文件和子目录的数组
  files = fs.readdirSync(jsPath);
  files.forEach(fileName => {
    if (jsMapReg.test(fileName)) {
      fs.unlinkSync(jsPath + fileName);
    }
  });
}
