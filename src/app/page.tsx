import Image from "next/image";
import Button from '@/app/components/common/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1>Title</h1>
        Header text
      </div>
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <Button
          href="/character"
          variant="primary">Character Manager</Button>
          <Button
          href="/vorago"
          variant="primary">Vorago</Button>
      </div>
    </main>
  );
}
