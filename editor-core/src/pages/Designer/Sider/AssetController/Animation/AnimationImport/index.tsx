import { useRef, useState } from 'react';
import { Button, message, Radio, Form, Input, Row, Modal } from 'antd';
import { useAssetAeAByObserver, observer, AeAItem } from '@hc/editor-core';
import './index.modules.less';
import { XiuIcon } from '@/components';
import NoTitleModal from '@/components/NoTitleModal';
import type { FormInstance } from 'antd/es/form';
import { saveAnimation } from '@/api/animation';
import { stopPropagation } from '@/utils/single';
import { useAnimationImport } from './hook';

// todo 自定义上传动画组件

/**
 * 1:只允许设计师上传
 * 2:自定义动画字段名称为，attr.kw
 * 3:自定义动画就是驻场动画，与aea和animation旧动画字段冲突，设置自定义动画，自动顶替掉aea和animation字段
 * 4: kw: {
 *           ip: data.ip, // 开始帧
 *           op: totalFrames, // 结束帧
 *           ks, 动画轨迹
 *         }
 *         示例模板：4028877
 */

function CustomAnimationImport(props: { onChange: (type: string) => void }) {
  const { onChange } = props;
  const { directPreview, previewEnd } = useAssetAeAByObserver();
  const { checkAE } = useAnimationImport();
  const formElement = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // 弹窗显示
  const [visible, setVisible] = useState(false);
  // 按钮加载状态
  const [loading, setLoading] = useState(false);
  const [ae, setAe] = useState();
  const [type, setType] = useState<string>();
  const [kw, setKw] = useState<AeAItem>();
  const [form] = Form.useForm();
  const chooseFile = () => {
    fileInput.current && fileInput.current.click();
  };
  const resetForm = () => {
    formElement.current && formElement.current.reset();
  };
  const onFileSelected = e => {
    const file = e.currentTarget.files[0];
    if (file.type !== 'application/json') {
      message.warn('文件类型错误！');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      resetForm();
      const aea = checkAE(data);
      if (aea) {
        let ae_type = 'in';
        if (aea?.kw?.op > 30) {
          ae_type = 'free';
        }
        setType(ae_type);
        previewEnd();
        directPreview(ae_type === 'in' ? 'i' : 'o', aea);
        if (aea.kw) {
          setAe(data);
          setKw(aea.kw);
          form.setFieldsValue({ type: ae_type, title: data?.nm });
          // 预览动画会在1s以内播放
          setTimeout(() => {
            setVisible(true);
          }, 1100);
        }
      }
    };

    reader.readAsText(file);
  };
  const onFinish = async (values: any) => {
    setLoading(true);
    form
      .validateFields()
      .then(async () => {
        const res = await saveAnimation({
          ...values,
          json_ae: JSON.stringify(ae),
          json_kw: JSON.stringify(kw),
        });
        if (res.code === 0) {
          setVisible(false);
          form.resetFields();
          message.success('动画上传成功！');
          onChange(values.type);
        }
      })
      .catch(error => {
        console.log('Failed:', error);
      });
    setLoading(false);
  };
  return (
    <>
      <form ref={formElement} style={{ display: 'none' }}>
        <input
          title="上传自定义动画"
          type="file"
          accept=".json"
          onChange={onFileSelected}
          ref={fileInput}
        />
      </form>
      <Button
        className="import-button"
        icon={<XiuIcon type="iconshangchuan" />}
        onClick={chooseFile}
      >
        上传自定义动画
      </Button>
      <Modal
        visible={visible}
        title="上传自定义动画"
        className="aniImp-upload-modal"
        width={520}
        footer={null}
        onCancel={() => {
          setVisible(false);
          form?.resetFields();
        }}
        destroyOnClose
      >
        <Form
          preserve
          form={form}
          name="control-ref"
          onFinish={onFinish}
          className="aniImp-upload-form"
          // initialValues={{
          //   type,
          //   title: ae?.nm,
          // }}
          onKeyPress={stopPropagation}
          onKeyDown={stopPropagation}
        >
          <Form.Item
            name="type"
            label="动画类型："
            rules={[
              {
                required: true,
                message: '请选择动画类型',
              },
            ]}
          >
            <Radio.Group>
              <Radio value="in" disabled={type === 'free'}>
                入场动画
              </Radio>
              <Radio value="out" disabled={type === 'free'}>
                出场动画
              </Radio>
              {/* <Radio value="stay">驻场动画</Radio> */}
              <Radio value="free" disabled={type === 'in'}>
                自由动画
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="title"
            label="动画标题："
            rules={[
              {
                required: true,
                message: '请输入动画标题',
              },
            ]}
          >
            <Input placeholder="请输入动画标题" maxLength={30} />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24 }}>
            <Row justify="center">
              <Button
                loading={loading}
                size="large"
                type="primary"
                htmlType="submit"
                disabled={false}
                className="submit"
              >
                提交
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
export default observer(CustomAnimationImport);
