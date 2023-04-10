import styles from './index.less';

const CloudElementCatalog = (props: {
  data: any[];
  onChange: (param: any) => void;
}) => {
  const { data, onChange } = props;
  const colors = [
    '#33C586',
    '#3F73FF',
    '#2BAEFA',
    '#FA802B',
    '#A8BA72',
    '#776EF8',
  ];
  const catalogStyles = (index: number) => {
    return {
      background: colors[index % 5],
    };
  };
  return (
    <div className={styles.catalogList}>
      {data.map((item: any, index: number) => {
        return (
          <div
            className={styles.catalog}
            style={catalogStyles(index)}
            key={item.id}
            onClick={() => {
              onChange(item);
            }}
          >
            <div className={styles.catalogPic}>
              <img src={item.cover_url} alt="" />
            </div>
            <div className={styles.catalogTitle}>{item.class_name}</div>
          </div>
        );
      })}
    </div>
  );
};
export default CloudElementCatalog;
