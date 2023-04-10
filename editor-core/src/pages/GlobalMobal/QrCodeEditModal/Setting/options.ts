interface TextTypeOpt {
  key: string;
  text: string;
  label: string;
  placeholder: string;
}

export const textTypeOptions: Record<string, TextTypeOpt> = {
  url: {
    key: 'url',
    text: '网址',
    label: '网络链接',
    placeholder: '例如：http://xiudodo.com',
  },
  wxUrl: {
    key: 'wxUrl',
    text: '微信公众号',
    label: '公众号ID',
    placeholder: '请输入微信公众号ID 例如：gh_3fe6ee52ee0e',
  },
  text: {
    key: 'text',
    text: '文本',
    label: '文本信息',
    placeholder: '请输入文本内容',
  },
};
