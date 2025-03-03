function loadExcelFile(event) {
  return new Promise((resolve, reject) => {
    var file = event.target.files[0];

    // reader.readAsDataURL(file);

    var reader = new FileReader();
    reader.onload = function (event) {
      const mimeType = file.type; // 这里就是MIME类型
      console.log("文件的MIME类型:", mimeType);

      var data = new Uint8Array(event.target.result);
      var workbook = XLSX.read(data, { type: "array" });
      resolve(workbook);
    };
    reader.readAsArrayBuffer(file);
  });
}
