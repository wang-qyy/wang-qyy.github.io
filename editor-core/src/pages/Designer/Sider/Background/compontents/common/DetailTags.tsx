import { useEffect } from 'react';
import { useSetState } from 'ahooks';
import { getBgImage, getBgVideo } from '@/api/background';
import Tag from './tag';
import styles from '../index.less';

const DetailTags = (Props: {
  title: '图片背景' | '视频背景' | '组件背景';
  bindClickTag: (type: string, id: number | string) => void;
}) => {
  const { title, bindClickTag } = Props;
  const [state, setState] = useSetState({
    tagArr: [],
    classifyArr: [],
    sceneArr: [],
  });
  useEffect(() => {
    if (title === '视频背景') {
      getBgVideo().then(res => {
        if (res.code === 0) {
          const arr = res.data.map((item: any) => {
            const obj: any = {};
            obj.name = item.class_name;
            obj.id = item.class_id;
            return obj;
          });
          setState({
            tagArr: arr,
          });
        }
      });
    } else if (title === '图片背景') {
      getBgImage().then(res => {
        if (res.code === 0) {
          const { scene, tag } = res.data;
          const sceneArr = scene.map((item: any) => {
            const obj: any = {};
            obj.name = item.class_name;
            obj.id = item.id;
            return obj;
          });
          const classifyArr = tag.map((item: any) => {
            const obj: any = {};
            obj.name = item.tagname;
            obj.id = item.id;
            return obj;
          });
          setState({
            classifyArr,
            sceneArr,
          });
        }
      });
    }
  }, []);

  return (
    <div className={styles.tagWarp}>
      {title === '视频背景' && (
        <>
          <Tag
            title="分类"
            bindClickTag={id => bindClickTag('class_id', id)}
            data={state.tagArr}
          />
          <Tag title="版式" bindClickTag={id => bindClickTag('ratio', id)} />
        </>
      )}
      {title === '图片背景' && (
        <>
          <Tag
            title="分类"
            bindClickTag={id => bindClickTag('class_id', id)}
            data={state.sceneArr}
          />
          <Tag
            title="风格"
            bindClickTag={id => bindClickTag('tag_id', id)}
            data={state.classifyArr}
          />

          <Tag title="版式" bindClickTag={id => bindClickTag('ratio', id)} />
        </>
      )}
    </div>
  );
};

export default DetailTags;
