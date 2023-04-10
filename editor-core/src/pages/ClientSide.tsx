import Layout from '@/pages/Layout';
import Content from '@/pages/Content';
import Header from '@/pages/Header';

export default function Main() {
  return <Layout header={<Header />} content={<Content />} />;
}
