import { Button, Upload } from "antd";

export function FileSender({
  onprogress,
  url,
}: {
  onprogress?: (evt: ProgressEvent) => void;
  url: string;
}) {
  const send = (formData: any) => {
    return new Promise<{ code: number; data: Record<string, string> }>(
      (resolve, reject) => {
        const xhr = new window.XMLHttpRequest();
        xhr.onload = () => {
          if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            const res = JSON.parse(xhr.response);
            resolve(res);
          } else {
            reject(xhr);
          }
        };

        xhr.onerror = (err) => {
          reject(err);
        };

        if (onprogress) xhr.upload.onprogress = onprogress;

        xhr.open("post", url, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Authorization", "Basic cG5ndHJlZTo1WVVJV0RITA==");

        xhr.send(formData);
      }
    );
  };
  return { send };
}

export default () => {
  const { send } = FileSender({
    url: "/supportPngTreeApi/api-pro/edit-upload-back",
    onprogress: () => {},
  });
  return (
    <Upload
      beforeUpload={(file) => {
        const formData = new FormData();

        formData.append("file", file);
        send(formData);
        return false;
      }}
    >
      <Button>上传</Button>
    </Upload>
  );
};
