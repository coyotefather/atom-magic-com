import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';
import Cards from '@/app/components/home/Cards';

export default function Home() {
  return (
    <main className="inconsolata container flex min-h-screen flex-col items-center justify-between p-24">
      <Breadcrumbs page="Tools" parents={[
        { href: "/test1", name: "test 1" },
        { href: "/test1/test2", name: "test 2" },
      ]} />
      <Header title="Tools">
          Some text
      </Header>
      <Cards />
    </main>
  );
}
