import { useState, useEffect } from 'react';
import { Button, Form, Input, Radio, Checkbox, Row, Col, message } from 'antd';
import { useRequest } from 'ahooks';
import TagGroup from '@/components/TagGroup';

import { getTemplate } from '@/store/adapter/useTemplateInfo';

import { stopPropagation } from '@/utils/single';
import { submitTemplate } from '@/api/pub';
import { designerGetLabelList } from '@/api/template';

import getUrlProps from '@/utils/urlProps';
import VideoCover from '../VideoCover';

import { industry, classify, templateStyles } from '../mock';

import styles from './index.modules.less';

export default function Content() {
  const [form] = Form.useForm();

  const [titleLen, setTitleLen] = useState(0);

  const [isNew, setIsNew] = useState(false);

  const [labalData, setLabalData] = useState({
    s: [],
    i: [],
    c: [],
  });

  const dataInfo = getTemplate()?.dataInfo;

  const { run: labelRun } = useRequest(designerGetLabelList, {
    manual: true,
    onSuccess(res) {
      if (res) {
        setLabalData(res);
      }
    },
  });

  // 提交模板
  const { loading, run } = useRequest(submitTemplate, {
    manual: true,
    onSuccess(res) {
      if (res) {
        // 跳转工作台
        window.open(
          'https://movie.xiudodo.com/designer/workbench/#/myworks',
          '_self',
        );
      }
    },
    onError() {
      message.error('提交失败请稍后重试');
    },
  });
  useEffect(() => {
    if (dataInfo?.template_type === 4) {
      setIsNew(true);
      labelRun();
    } else {
      setIsNew(false);
    }
  }, []);

  // 提交
  async function handleSubmit(value: any) {
    const { upicId } = getUrlProps();

    value.description.join(' ');

    run(Number(upicId), { ...value, description: value.description.join(' ') });
  }

  return (
    <div>
      <Form
        form={form}
        // onFinish={handleSubmit}
        validateMessages={{ required: '请设置${label}' }}
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 10 }}
        initialValues={{
          industry_id: dataInfo?.class_ids,
          category_id: dataInfo?.class_ids,
          style_id: dataInfo?.tag_ids,
          title: dataInfo?.title,
          description: dataInfo?.description
            ? dataInfo.description.split(' ')
            : [],
        }}
      >
        <Form.Item label="封面设置" required>
          <VideoCover form={form} />
        </Form.Item>

        <Form.Item label="作品标题" name="title" rules={[{ required: true }]}>
          <Input
            placeholder=""
            maxLength={20}
            suffix={<div className={styles['input-suffix']}>{titleLen}/20</div>}
            onChange={value => {
              setTitleLen(value.target.value.length);
            }}
            onKeyDown={stopPropagation}
            onPaste={stopPropagation}
          />
        </Form.Item>
        <Form.Item
          label="关键词描述"
          name="description"
          required
          rules={[
            () => ({
              validator(t, value) {
                if (value.length >= 7) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('请输入不少于7个关键词！'));
              },
            }),
          ]}
        >
          <TagGroup />
          {/* <Input
            placeholder="关键词不少于7个，中间用空格隔开"
            onKeyDown={stopPropagation}
            onPaste={stopPropagation}
          /> */}
        </Form.Item>

        {isNew ? (
          <>
            <Form.Item
              label="分类"
              name="category_id"
              rules={[{ required: true }]}
            >
              <Checkbox.Group style={{ display: 'block' }}>
                <Row gutter={[0, 16]}>
                  {labalData?.c?.map(item => (
                    <Col key={item.id} span={4}>
                      <Checkbox value={item.id}>{item.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item
              label="风格"
              name="style_id"
              rules={[{ required: true }]}
            >
              <Checkbox.Group style={{ display: 'block' }}>
                <Row gutter={[0, 16]}>
                  {labalData?.s?.map(item => (
                    <Col key={item.id} span={4}>
                      <Checkbox value={item.id}>{item.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item
              label="行业"
              name="industry_id"
              rules={[{ required: true }]}
            >
              <Checkbox.Group style={{ display: 'block' }}>
                <Row gutter={[0, 16]}>
                  {labalData?.i?.map(item => (
                    <Col key={item.id} span={4}>
                      <Checkbox value={item.id}>{item.name}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="分类"
              name="category_id"
              rules={[{ required: true }]}
            >
              <Radio.Group style={{ display: 'block' }}>
                <Row gutter={[0, 16]}>
                  {classify.map(item => (
                    <Col key={item.id} span={4}>
                      <Radio value={item.id}>{item.name}</Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="风格"
              name="style_id"
              rules={[{ required: true }]}
            >
              <Radio.Group style={{ display: 'block' }}>
                <Row gutter={[0, 16]}>
                  {templateStyles.map(item => (
                    <Col key={item.id} span={4}>
                      <Radio value={item.id}>{item.name}</Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="行业"
              name="industry_id"
              rules={[{ required: true }]}
            >
              <Radio.Group style={{ display: 'block' }}>
                <Row gutter={[0, 16]}>
                  {industry.map(item => (
                    <Col key={item.id} span={4}>
                      <Radio value={item.id}>{item.name}</Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>
          </>
        )}
        <Form.Item wrapperCol={{ span: 24 }} shouldUpdate>
          {() => (
            <Row justify="center">
              <Button
                loading={loading}
                size="large"
                type="primary"
                // htmlType="submit"
                // disabled={
                //   !form.isFieldsTouched(true) ||
                //   !!form.getFieldsError().filter(({ errors }) => errors.length)
                //     .length
                // }
                style={{ width: 237 }}
                onClick={() => {
                  form
                    .validateFields()
                    .then(() => {
                      handleSubmit(form.getFieldsValue());
                    })
                    .catch(error => {});
                }}
              >
                提交
              </Button>
            </Row>
          )}
        </Form.Item>
      </Form>
    </div>
  );
}
