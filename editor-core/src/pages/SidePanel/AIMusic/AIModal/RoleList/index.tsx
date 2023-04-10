import { getAIVoices } from '@/api/music';
import { useRequest } from 'ahooks';
import { Tabs } from 'antd';
import { memo, useEffect, useState } from 'react';
import '../index.less';
import RoleItem from './item';

interface RoleListProps {
  role: string;
  onSelect: (val: { role: string; roleType: string }) => void;
}
const RoleList = (props: RoleListProps) => {
  const { role, onSelect } = props;
  // 所有的数据
  const [data, setData] = useState([]);
  // 过滤分类之后的数据
  const [roleList, setRoleList] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [activeKey, setActiveKey] = useState('通用');
  const changeKey = (key: string) => {
    setActiveKey(key);
    const newArray = data.filter(item => item.category_name === key);
    setRoleList(newArray);
  };
  async function getData() {
    const res = await getAIVoices();
    const list = res.data;
    const newArray: any[] = [];
    setData(list);

    const newCatalog: string[] = [];
    list.forEach((element: any) => {
      if (!newCatalog.includes(element.category_name)) {
        newCatalog.push(element.category_name);
      }
      if (element.category_name === activeKey) {
        newArray.push(element);
      }
    });
    setRoleList(newArray);
    if (newCatalog.length > 0) {
      setActiveKey(newCatalog[0]);
    }
    setCatalog(newCatalog);
  }
  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="role-part">
      <Tabs activeKey={activeKey} onChange={changeKey}>
        {catalog.map(item => {
          return <Tabs.TabPane key={item} tab={item} />;
        })}
      </Tabs>
      <div className="role-list">
        {roleList.map(item => {
          return (
            <RoleItem
              data={item}
              key={item.voice_key}
              onSelect={val => {
                onSelect({ role: val, roleType: activeKey });
              }}
              choosed={item.voice_key === role}
            />
          );
        })}
      </div>
    </div>
  );
};
export default memo(RoleList);
