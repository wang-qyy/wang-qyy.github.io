import type { RcFile } from "antd/es/upload";
import { Button, Upload } from "antd";
import { useState } from "react";

export default function () {
  const [base64, setBase64] = useState("");
  const getBase64 = async (file: RcFile) => {
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
        setBase64(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
    });

    return false;
  };

  return (
    <div>
      <Upload beforeUpload={getBase64} showUploadList={false}>
        <Button> Upload </Button>
      </Upload>

      <img src={base64} />
    </div>
  );
}
