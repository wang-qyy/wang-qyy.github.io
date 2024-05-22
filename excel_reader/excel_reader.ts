function getType(str) {
  const name = str.trim();

  const format_title = name
    .replace(/:+/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const url = `/ai-writer/${format_title}`;
  const _type = url.replace("/ai-writer/", "").replace(/-+/g, "_");
  return { url, type: _type };
}

function getEnText(event) {
  loadExcelFile(event).then((workbook) => {
    // 处理excelData
    const arr = [];
    workbook.SheetNames.forEach((sheetName) => {
      if (["数据源总"].includes(sheetName)) return;

      var worksheet = workbook.Sheets[sheetName];

      let arrItem = arr.find((item) => item.type == sheetName);

      const pTitle = sheetName.charAt(0).toUpperCase() + sheetName.slice(1);
      let pType = sheetName.toLowerCase().replace(/\s+/g, "_");

      if (!arrItem) {
        arrItem = {
          type: pType,
          name: pTitle,
          img: imgs[pType],
          children: [],
        };
      }

      var excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("worksheet", { sheetName, worksheet, excelData });

      // console.log(excelData);
      excelData.forEach((row, index) => {
        if (index == 0) return;
        // 原用例、用例chatgpt重写、url、分类、原描述、用例chatgpt重写描述、图标、Description、Keywords
        // let [
        //   oldTitle,
        //   name,
        //   url,
        //   classify,
        //   oleDesc,
        //   desc,
        //   icon,
        //   title,
        //   description,
        //   keywords,
        // ] = row;

        let [
          oldTitle,
          name,
          classify,
          oleDesc,
          desc,
          url,

          // icon,
          // title,
          // description,
          // keywords,
        ] = row;

        if (name) {
          name = name.trim();

          const format_title = name
            .replace(/:+/g, "")
            .replace(/’/, "")
            .replace(/\s+/g, "-")
            .toLowerCase();

          if (sheetName === "Popular Tools") {
            url = url;
          } else {
            url = `/ai-writer/${format_title}`;
          }

          const _type = url.replace("/ai-writer/", "").replace(/-+/g, "_");

          arrItem.children.push({
            parent_type: pType,
            type: _type,
            name,
            url,
            desc,
            // img: icon || imgs[pType],
            img: imgs[pType],
            title: "",
            description: "",
            keywords: "",
          });
        }
      });
      arr.push(arrItem);
    });

    console.log("getEnText", arr);
  });
}
