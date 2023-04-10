import { Modal, Form, Input, Button, message } from 'antd';
import { feadback } from '@/api/feadback';
import { SmileOutlined } from '@ant-design/icons';

import './index.less';
import { stopPropagation } from '@/utils/single';
import { CSSProperties, PropsWithChildren } from 'react';

interface FeedbackProps {
  visible: boolean;
  onCancel: () => void;
  style?: CSSProperties;
}

const Feedback = ({
  visible,
  onCancel,
  style,
}: PropsWithChildren<FeedbackProps>) => {
  // 成功提示
  const successTip = (
    <div className="success-tip">
      <div>提交成功！</div>
      <p>有了您的意见，我们会变得更好~</p>
    </div>
  );

  // 提交
  const handleSubmit = async (value: { content: string; contact: string }) => {
    if (!value.contact || !value.content) {
      message.info('请输入您的意见建议及联系方式', 2);
      return;
    }

    const response = await feadback(value);

    if (response.code === 0) {
      onCancel();
      setTimeout(() => {
        message.success({
          icon: <SmileOutlined className="smile-icon" />,
          content: successTip,
          duration: 3,
        });
      }, 500);
    }
  };
  return (
    <Modal
      visible={visible}
      centered
      width={727}
      footer={false}
      onCancel={onCancel}
      getContainer={document.getElementById('xiudodo')}
    >
      <div className="feedback-title">感谢您的意见反馈</div>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="意见建议" name="content">
          <Input.TextArea
            autoSize={{ maxRows: 5, minRows: 5 }}
            bordered={false}
            placeholder="您对我们产品有什么不满意的,快来吐槽吧··吐槽会让我们变得更好!"
            className="input-background"
            onKeyDown={stopPropagation}
          />
        </Form.Item>
        <Form.Item label="您的联系方式" name="contact">
          <Input
            placeholder="输入您的手机号、qq号或邮箱"
            bordered={false}
            className="input-background"
            onKeyDown={stopPropagation}
          />
        </Form.Item>
        <div className="submit-btn">
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
export default Feedback;
