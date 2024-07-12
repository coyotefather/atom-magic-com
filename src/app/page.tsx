import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';
import Cards from '@/app/components/home/Cards';

export default function Home() {
  return (
    <main className="inconsolata container flex min-h-screen flex-col items-center justify-between p-24 pt-12">
      <Breadcrumbs page="Tools" />
      <Header name="Tools">
          Some text
      </Header>
      <Cards />
    </main>
  );
}
