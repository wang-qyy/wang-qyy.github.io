import { useGetAllTemplateByObserver, observer } from '@hc/editor-core';
import Cameras from '.';
import styles from './index.less';

const CamerasMain = () => {
  const { templates } = useGetAllTemplateByObserver();

  return (
    <div className={styles['designer-timeLine']}>
      {templates.map(item => {
        return <Cameras template={item} key={item.id} />;
      })}
    </div>
  );
};
export default observer(CamerasMain);
