const eg_RegExp = /字段(\d+)样例/g;

function writing(event) {
  console.log("writing");

  loadExcelFile(event).then((workbook) => {
    const arr = [];

    workbook.SheetNames.forEach((sheetName) => {
      if (!["数据源总"].includes(sheetName)) {
        var worksheet = workbook.Sheets[sheetName];

        var excelData = XLSX.utils.sheet_to_json(worksheet, { header: 3 });
        console.log("worksheet to json", excelData);

        excelData.forEach((item) => {
          if (item["分类"] == "popular_tools") {
            console.log(item);
          }
          const inputs = [];
          const name = item["用例chatgpt重写"]?.trim() || "";
          const format_title = name
            .replace(/:+/g, "")
            .replace(/’/, "")
            .replace(/\s+/g, "-")
            .toLowerCase();

          const url = item.url || `/ai-writer/${format_title}`;

          const _type = url.replace("/ai-writer/", "").replace(/-+/g, "_");

          let temp;

          Object.keys(item).forEach((name) => {
            const value = item[name];

            if (name.indexOf("输入字段") > -1) {
              // inputs.push({ label: item[name] })
              temp = { label: value };
              inputs.push({ ...temp, example: "" });
            } else if (name.indexOf("字段") > -1 && name.indexOf("样例") > -1) {
              try {
                inputs.forEach((inp) => {
                  if (inp.label === temp.label) {
                    temp = { ...temp, example: value };
                    inp.example = value;
                  }
                });
              } catch (error) {
                console.log({ name, value });
              }

              // if (temp) {
              //   temp = { ...temp, example: value };
              //   inputs.push({ ...temp });
              temp = undefined;
              // }
            }
          });
          //   console.log("label===", _type, inputs, temp);

          const parent_type = sheetName.toLowerCase().replace(/\s+/g, "_");
          arr.push({
            parent_type,
            type: _type,
            order: item["提问命令"],
            inputs: JSON.parse(JSON.stringify(inputs)),
          });
        });
      }
    });
    console.log("writing", arr);
  });
}
