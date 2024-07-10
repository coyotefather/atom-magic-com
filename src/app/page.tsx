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
        <Card
          image={ { src: "/Wheel_of_Cardinals.svg", alt: "Wheel of Cardinals", width: 500, height: 500 } }
          button={ { href: "/character", text: "Manage a Character", variant: "gradient" } }
          title="Character Manager"
          description="Build and manage a new character in minutes." />
        <Card
          image={ { src: "/Wheel_of_Cardinals.svg", alt: "Wheel of Cardinals", width: 500, height: 500 } }
          button={ { href: "/vorage", text: "Play Vorago", variant: "gradient" } }
          title="Vorago"
          description="Play a game of Vorago with a friend." />
      </div>
    </main>
  );
}
