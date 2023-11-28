
 function loadExcelFile(event) {
    return new Promise((resolve, reject) => {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            var data = new Uint8Array(event.target.result);
            var workbook = XLSX.read(data, { type: "array" });
            resolve(workbook);
        };
        reader.readAsArrayBuffer(file);
    });
}