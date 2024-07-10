import Image from "next/image";
import Button from '@/app/components/common/Button';
import Card from '@/app/components/common/Card';

export default function Home() {
  return (
    <main className="inconsolata flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1>Title</h1>
        Header text
      </div>
      <div className="mb-32 w-full grid grid-cols-2">
        <div>
          <div className="flex h-40 mb-4">
            <Image
              className="object-cover"
              src="/Wheel_of_Cardinals.svg"
              alt="Wheel of Cardinals"
              width={500}
              height={500} />
          </div>
          <div>
            <h2 className="text-xl pb-2">Character Manager</h2>
            <p className="pb-2">Build and manage a new character in minutes.</p>
            <Button
              href="/character"
              variant="gradient">Character Manager</Button>
          </div>
        </div>
        <div className="w-1/2 h-20">
          <Button
          href="/vorago"
          variant="primary">Vorago</Button>
        </div>
      </div>
    </main>
  );
}
