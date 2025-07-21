import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const xlsxPath = "./src/pages/translate/lovepik/translate.xlsx";
// const localePath = "./src/pages/translate/lovepik/Lang";
const localePath =
  "/Users/craig/Desktop/wqy/pngtree/lovepik-web/lovepik_astro/Application/Common/Lang";
// ../../../../../../../../src/pages/translate/lovepik/Lang

// const files = fs
//   .readdirSync(localePath)
//   .filter((file) => fs.statSync(path.join(localePath, file)).isFile());

const filesName = [
  "ar-sa.php",
  "bn-bd.php",
  "de-de.php",
  "en-us.php",
  "es-sp.php",
  "fr-fr.php",
  "he-il.php",
  "hi-in.php",
  "id-id.php",
  "it-it.php",
  "ja-jp.php",
  "ko-kr.php",
  "ms-my.php",
  "nl-nl.php",
  "pl-pl.php",
  "pt-pt.php",
  "ru-ru.php",
  "th-th.php",
  "tl-ph.php",
  "tr-tr.php",
  "vn-vi.php",
  "zh-cn.php",
];

console.log("开始翻译", filesName.length);

// 读取Excel文件
const workbook = XLSX.readFile(path.resolve(xlsxPath));

// 获取第一个工作表
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// 将工作表转换为JSON对象
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 3 }); // header: 3 表示第一行作为列名

// fs.writeFileSync(
// path.join(localePath, `data.ts`),
// 'export default ' + JSON.stringify(jsonData),
// );
console.log(jsonData);

jsonData.forEach((row) => {
  for (const key in row) {
    const text = row[key];

    const phpFilePath = filesName.filter((name) => name.includes(key))?.[0];

    if (phpFilePath) {
      const fullPath = `${localePath}/${phpFilePath}`;
      let content = fs.readFileSync(fullPath, "utf8");
      const key_name =
        row.key ||
        row.en.trim().toLowerCase().replaceAll(" ", "_").replaceAll(",", "");

      const insertPosition = content.lastIndexOf("\n);") - 1;
      if (insertPosition === -1) {
        throw new Error(key + "未找到插入位置标记");
      }
      const insertContent = `,\n    "${key_name}"=>'${text}'`;

      // console.log(insertContent);

      content =
        content.slice(0, insertPosition) +
        insertContent +
        content.slice(insertPosition);

      // 4. 写回文件
      fs.writeFileSync(fullPath, content);
      // console.log("内容插入成功");
      // fs.appendFileSync(
      //   path.resolve(`${localePath}/${phpFilePath}`),
      //   insertContent
      // );
    }
  }
});
