import { MouseEvent, useState } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  Button,
  Radio,
  message,
  Checkbox,
} from 'antd';

import TagGroup from '@/components/TagGroup';

import { videoFileUploadSubmit, imageFileUploadSubmit } from '@/api/upload';
import { stopPropagation } from '@/utils/single';

import ConfrimModal from './ConfrimModal';
import { VIDEO_CLASSIFY, ASSET_TAGS } from '../const';

import FileUpload, {
  PreviewUploadDesc,
  SourceFileUploadDesc,
  VideoUploadDesc,
} from './Upload';
import './index.less';

// 测试数据
const initialValues = {
  origin_file_path:
    '/video-uploads/frames/2022-07-28/40b11f75-c041-30e3-abbc-9ef5d361e89f.zip',
  preview:
    '/video-uploads/previews/2022-07-28/12732913-e303-3cab-aa19-6a1f86e61605.png',
  source_file:
    '/video-uploads/sources/2022-07-28/12e98826-d5b2-33b0-91b7-5fabfd92382a.zip',
  copyright_type: 4,
  alpha_flag: 0,
  title: '1',
  class_id: 10,
  description: '1',
};

const { Item } = Form;

export type ModuleType = 'video' | 'image';
interface UploadModuleProps {
  onOk: (fileId: string) => void;
  scope_type: 'bg' | 'lottie' | 'png';
}

export default function UploadModule(props: UploadModuleProps) {
  const { onOk, scope_type } = props;
  const [confirmModal, setConfirmModal] = useState(false);
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState(); // 素材类型

  const [source, setSource] = useState<number[]>([]); // 素材来源

  const [form] = Form.useForm();

  async function onFinish(e: MouseEvent<HTMLDivElement>) {
    const formValue = form.getFieldsValue();

    const { preview, description, ...others } = formValue;

    const params = {
      ...others,
      description: description.join(' '),
      preview: preview.path,
      width: preview.width,
      height: preview.height,
      mime: preview.mime,
    };

    // todo 提交
    console.log('todo 提交', formValue);

    const res = await (scope_type === 'png'
      ? imageFileUploadSubmit(params)
      : videoFileUploadSubmit({ ...params, scope_type }));

    if (res.code === 0) {
      message.success('提交成功');
      setConfirmModal(false);
      onOk(res.data.id);
    } else {
      message.info(res.ms);
    }
  }

  return (
    <>
      <Form
        form={form}
        className="upload-form"
        labelAlign="right"
        // initialValues={initialValues}
        // onFinish={() => {
        //   if (
        //     !form.getFieldsError().filter(({ errors }) => errors.length).length
        //   ) {
        //     setConfirmModal(true);
        //   }
        // }}
      >
        <Row gutter={16} justify="center">
          {scope_type !== 'png' && (
            <Col span={8}>
              <Item
                label="视频文件上传"
                name="origin_file_path"
                labelCol={{ span: 24 }}
                rules={[{ required: true, message: '请上传视频文件上传' }]}
                getValueFromEvent={value => value.path}
              >
                <FileUpload
                  desc={<VideoUploadDesc />}
                  accept="application/x-zip-compressed,application/zip"
                  upload_type="frame"
                  moduleType="video"
                />
              </Item>
            </Col>
          )}

          <Col span={8}>
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
                moduleType="video"
              />
            </Item>
          </Col>
          <Col span={8}>
            <Item
              label="源文件上传"
              name="source_file"
              labelCol={{ span: 24 }}
              rules={[
                { required: scope_type !== 'png', message: '请上传源文件' },
              ]}
              getValueFromEvent={value => value.path}
            >
              <FileUpload
                desc={<SourceFileUploadDesc />}
                accept="application/x-zip-compressed,application/zip"
                upload_type="source"
                moduleType="video"
              />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Item
              label="版权类型"
              name="copyright_type"
              rules={[{ required: true, message: '请选择版权类型' }]}
              getValueFromEvent={e => {
                setSourceType(e.target.value);
                return e.target.value;
              }}
            >
              <Radio.Group>
                <Radio value={3}>纯原创</Radio>
                <Radio value={4}>伪原创</Radio>
              </Radio.Group>
            </Item>
          </Col>
          {scope_type !== 'png' && (
            <Col span={16}>
              <Item
                label="透明标识"
                name="alpha_flag"
                rules={[{ required: true, message: '请选择透明标识' }]}
              >
                <Radio.Group>
                  <Radio value={0}>未知</Radio>
                  <Radio value={1}>透明</Radio>
                  <Radio value={2}>不透明</Radio>
                </Radio.Group>
              </Item>
            </Col>
          )}

          {sourceType === 4 && (
            <>
              <Col span={8}>
                <Item
                  label="素材来源"
                  name="source"
                  rules={[{ required: true, message: '请选择素材来源' }]}
                >
                  <Checkbox.Group onChange={setSource}>
                    <Checkbox value={1}>站内素材</Checkbox>
                    <Checkbox value={2}>站外素材</Checkbox>
                  </Checkbox.Group>
                </Item>
              </Col>
              {source.indexOf(1) > -1 && (
                <Col span={24}>
                  <Item
                    label="站内素材ID"
                    name="asset_ids"
                    rules={[{ required: true, message: '请填写素材ID' }]}
                  >
                    <Input
                      onPaste={stopPropagation}
                      onKeyDown={stopPropagation}
                      placeholder="请填写站内素材ID，各素材之间用英文逗号隔开"
                    />
                  </Item>
                </Col>
              )}
              {source.indexOf(2) > -1 && (
                <Col span={24}>
                  <Item
                    label="站外素材链接"
                    name="asset_links"
                    rules={[{ required: true, message: '请填写素材链接' }]}
                  >
                    <Input
                      onPaste={stopPropagation}
                      onKeyDown={stopPropagation}
                      placeholder="请填写站外素材链接，各链接之间用空格隔开"
                    />
                  </Item>
                </Col>
              )}
            </>
          )}

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

          <Col span={8}>
            <Item
              label="分类"
              name="class_id"
              rules={[{ required: true, message: '请选择素材分类' }]}
            >
              <Select
                options={scope_type === 'png' ? ASSET_TAGS : VIDEO_CLASSIFY}
              />
            </Item>
          </Col>
          <Col span={16}>
            <Item
              label="关键词"
              name="description"
              required
              rules={[
                () => ({
                  validator(t, value) {
                    if (!value || value.length < 3) {
                      return Promise.reject(new Error('请输入不少于3个关键词'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TagGroup />
              {/* <Input
                onPaste={stopPropagation}
                onKeyDown={stopPropagation}
                placeholder="关键词不少于7个，中间空格符隔开"
              /> */}
            </Item>
          </Col>
          <Col span={24} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: '#767676' }}>
              严禁上传非原创无版权作品，如造成版权纠纷等严重后果，由设计师本人承担经济赔偿以及法律后果。
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
              type="primary"
              // htmlType="submit"
              style={{ width: 237 }}
              onClick={() => {
                form
                  .validateFields()
                  .then(() => {
                    setConfirmModal(true);
                  })
                  .catch(error => {});
              }}
            >
              提交
            </Button>
          </Row>
        </Form.Item>
      </Form>

      <ConfrimModal
        visible={confirmModal}
        centered
        footer={null}
        onCancel={() => setConfirmModal(false)}
        onOk={onFinish}
      />
    </>
  );
}
