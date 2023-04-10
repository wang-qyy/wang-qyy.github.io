import { useState } from 'react';
import { Form, Button, Radio, Input, Row, Col, message } from 'antd';
import { useRequest } from 'ahooks';

import getUrlProps from '@/utils/urlProps';
import { submitTemplate, getModuleCategory } from '@/api/pub';
import { stopPropagation } from '@/utils/single';

import VideoCover from '../SubmitModal/VideoCover';

export default function SubmitModuleModal() {
  const [titleLen, setTitleLen] = useState(0);

  const [form] = Form.useForm();

  const { loading, run } = useRequest(submitTemplate, {
    manual: true,
    onSuccess(res) {
      if (res) {
        // 跳转工作台;
        window.open(
          'https://movie.xiudodo.com/designer/workbench/#/myworks?tag=3',
          '_self',
        );
      }
    },
    onError() {
      message.error('提交失败请稍后重试');
    },
  });

  // 提交
  async function handleSubmit(value: any) {
    const { upicId } = getUrlProps();
    run(Number(upicId), value);
  }

  const { data: classify = [] } = useRequest(getModuleCategory, {});

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      validateMessages={{ required: '请设置${label}' }}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item label="封面设置" required>
        <VideoCover form={form} hasDynamic={false} />
      </Form.Item>
      <Form.Item label="标题" name="title" rules={[{ required: true }]}>
        <Input
          placeholder=""
          maxLength={20}
          suffix={
            <div style={{ color: '#838390', fontSize: 12 }}>{titleLen}/20</div>
          }
          onChange={value => {
            setTitleLen(value.target.value.length);
          }}
          onKeyDown={stopPropagation}
          onPaste={stopPropagation}
        />
      </Form.Item>
      <Form.Item label="分类" name="category_id" rules={[{ required: true }]}>
        <Radio.Group style={{ display: 'block' }}>
          <Row gutter={[0, 16]}>
            {classify.map(item => (
              <Col key={item.id} span={4}>
                <Radio value={item.id}>{item.class_name}</Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }} shouldUpdate>
        {() => (
          <Row justify="center">
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              disabled={
                !form.isFieldsTouched(true) ||
                !!form.getFieldsError().filter(({ errors }) => errors.length)
                  .length
              }
              style={{ width: 237 }}
            >
              提交
            </Button>
          </Row>
        )}
      </Form.Item>
    </Form>
  );
}
