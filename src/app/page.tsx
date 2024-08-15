import Header from '@/app/components/common/Header';
import Cards from '@/app/components/home/Cards';

export default function Home() {
  return (
    <main className="inconsolata container flex min-h-screen flex-col items-center justify-between p-24 pt-12">
      <Header name="Home">
          Some text
      </Header>
      <Cards />
    </main>
  );
}
