import { MouseEvent, useState } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  Button,
  Modal,
  Radio,
  message,
} from 'antd';

import { imageFileUploadSubmit } from '@/api/upload';
import { stopPropagation } from '@/utils/single';
import ConfrimModal from './ConfrimModal';

import { ASSET_TAGS, IMAGE_BG_TAGS, IMAGE_BG_CLASSIFY } from '../const';

import FileUpload, { PreviewUploadDesc, SourceFileUploadDesc } from './Upload';
import './index.less';

const { Item } = Form;

const initialValues = {
  preview:
    '/image-uploads/previews/2022-07-27/f062bba8-aa1b-320d-bcf7-c4502b37e85a.png',
  source_file:
    '/image-uploads/sources/2022-07-27/cc3979ec-4653-3115-8aee-b8cce0efcd66.zip',
  tag_id: 86,
  asset_ids: '',
  title: '测试提交',
  description: '测试 提交',
};

export type ModuleType = 'video' | 'image';
interface UploadModuleProps {
  onOk: (fileId: string) => void;
}

export default function UploadModule(props: UploadModuleProps) {
  const { onOk } = props;
  const [confirmModal, setConfirmModal] = useState(false);
  const [title, setTitle] = useState('');
  const [kid, setKid] = useState<number>(1);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form] = Form.useForm();

  async function onFinish(e: MouseEvent<HTMLDivElement>) {
    const formValue = form.getFieldsValue();
    setSubmitLoading(true);

    // todo 提交
    console.log('todo 提交', formValue);

    const { preview, ...others } = formValue;

    const res = await imageFileUploadSubmit({
      ...others,
      preview: preview.path,
      width: preview.width,
      height: preview.height,
      mime: preview.mime,
    });

    setSubmitLoading(false);

    if (res.code === 0) {
      message.success('提交成功');
      setConfirmModal(false);

      onOk(res.data.id);
    } else {
      message.info(res.msg);
    }
  }

  return (
    <>
      <Form
        form={form}
        className="upload-form"
        labelAlign="right"
        initialValues={{
          // ...initialValues,
          type: 1,
          kid_1: kid,
        }}
        onFinish={() => {
          if (
            !form.getFieldsError().filter(({ errors }) => errors.length).length
          ) {
            setConfirmModal(true);
          }
        }}
      >
        <Row gutter={16} justify="center">
          <Col span={12}>
            <Item
              label="预览图上传"
              name="preview"
              labelCol={{ span: 24 }}
              rules={[{ required: true, message: '请上传预览图' }]}
            >
              <FileUpload
                desc={<PreviewUploadDesc />}
                accept="image/png,image/jpeg"
                limitSize={20}
                upload_type="preview"
                moduleType="image"
              />
            </Item>
          </Col>

          <Col span={12}>
            <Item
              label="源文件上传"
              name="source_file"
              labelCol={{ span: 24 }}
              // rules={[{ required: true, message: '请上传源文件' }]}
              getValueFromEvent={value => value.path}
            >
              <FileUpload
                desc={<SourceFileUploadDesc />}
                accept="application/x-zip-compressed"
                upload_type="source"
                moduleType="image"
              />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* <Col span={24}>
            <Item label="作品属性" name="type">
              <Radio.Group>
                <Radio value={1}>原创素材</Radio>
                <Radio value={2}>商用插画</Radio>
              </Radio.Group>
            </Item>
          </Col> */}

          <Col span={18}>
            <Form.Item label="分类" style={{ marginBottom: 0 }} required>
              <Form.Item
                name="kid_1"
                rules={[{ required: true, message: '请选择分类' }]}
                style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
              >
                <Select
                  options={[
                    { value: 1, label: '元素' },
                    { value: 2, label: '背景' },
                  ]}
                  onChange={setKid}
                />
              </Form.Item>
              {kid === 2 && (
                <Form.Item
                  name="class_id"
                  style={{
                    display: 'inline-block',
                    width: 'calc(50% - 8px)',
                    margin: '0 8px',
                  }}
                >
                  <Select options={IMAGE_BG_CLASSIFY} />
                </Form.Item>
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Item label="标签" name="tag_id">
              {/* <Radio.Group>
                <Row gutter={[0, 16]}>
                  {(kid === 1 ? ASSET_TAGS : IMAGE_BG_TAGS).map(item => (
                    <Col key={item.value} span={4}>
                      <Radio value={item.value}>{item.label}</Radio>
                    </Col>
                  ))} 
                </Row>
              </Radio.Group> */}
              <Select options={kid === 1 ? ASSET_TAGS : IMAGE_BG_TAGS} />
            </Item>
          </Col>

          <Col span={24}>
            <Item label="站内素材ID" name="asset_ids">
              <Input
                onPaste={stopPropagation}
                onKeyDown={stopPropagation}
                placeholder="请填写站内素材ID，各素材之间用英文逗号隔开"
              />
            </Item>
          </Col>

          <Col span={24}>
            <Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '请填写标题' }]}
              getValueFromEvent={e => {
                setTitle(e.target.value);
                return e.target.value;
              }}
            >
              <Input
                onPaste={stopPropagation}
                onKeyDown={stopPropagation}
                maxLength={20}
                suffix={<span>{title.length}/20</span>}
              />
            </Item>
          </Col>

          <Col span={24}>
            <Item
              label="关键词"
              name="description"
              rules={[{ required: true, message: '请填写关键词' }]}
            >
              <Input
                onPaste={stopPropagation}
                onKeyDown={stopPropagation}
                placeholder="关键词不少于7个，中间空格符隔开"
              />
            </Item>
          </Col>
          <Col span={24} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: '#767676' }}>
              严禁上传非原创无版权作品，如造成版权纠纷等严重后果，由设计师本人承担经济赔偿以及法律责任。
              {/* 详细文档键
              <a href="https://www.baidu.com" target="_blank" rel="noreferrer">
                《设计师违规处罚规则》
              </a> */}
            </span>
          </Col>
        </Row>

        <Form.Item wrapperCol={{ span: 24 }} shouldUpdate>
          <Row justify="center" style={{ marginTop: 24 }}>
            <Button
              loading={submitLoading}
              type="primary"
              htmlType="submit"
              style={{ width: 237 }}
            >
              提交
            </Button>
          </Row>
        </Form.Item>
      </Form>

      <ConfrimModal
        visible={confirmModal}
        onCancel={() => setConfirmModal(false)}
      />
    </>
  );
}
