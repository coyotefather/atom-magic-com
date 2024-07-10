import Image from "next/image";
import Button from '@/app/components/common/Button';
import Cards from '@/app/components/home/Cards';

export default function Home() {
  return (
    <main className="inconsolata flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1>Title</h1>
        Header text
      </div>
      <Cards />
    </main>
  );
}
