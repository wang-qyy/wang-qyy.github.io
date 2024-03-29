const eg_RegExp = /字段(\d+)样例/g

function writing(event) {
    loadExcelFile(event).then((workbook) => {
        const arr = [];
        
        workbook.SheetNames.forEach((sheetName) => {
            if (sheetName == "writing") {
                var worksheet = workbook.Sheets[sheetName];


                var excelData = XLSX.utils.sheet_to_json(worksheet, { header: 2 });
                console.log("worksheet", excelData);

                excelData.forEach((item) => {
                    const inputs = []
                    const name = item['用例chatgpt重写'].trim();
                    const format_title = name
                        .replace(/:+/g, "")
                        .replace(/\s+/g, "-")
                        .toLowerCase();
                    const url = `/ai-writer/${format_title}`;
                    const _type = url.replace("/ai-writer/", "").replace(/-+/g, "_");

                    let temp
                    Object.keys(item).forEach(name => {
                        const value = item[name];

                        if (name.indexOf('输入字段') > -1) {
                            // inputs.push({ label: item[name] })
                            temp = { label: value }
                        } else if (name.indexOf('字段') > -1 && name.indexOf('样例') > -1) {
                            if (temp) {
                                temp = { ...temp, example: value }
                                inputs.push(temp)
                                temp = undefined
                            }
                        }
                    })
                    arr.push({ parent_type: sheetName, type: _type, order: item['提问命令'], inputs })
                });

            }
        });

        console.log("getEnText", arr);
    });
}
