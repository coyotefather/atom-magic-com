import PageHero from '@/app/components/common/PageHero';
import LinkButton from '@/app/components/common/LinkButton';
import { mdiWifiOff } from '@mdi/js';

export const metadata = {
  title: 'Offline | Atom Magic',
  description: 'This page is not available offline.',
};

const OfflinePage = () => {
  return (
    <main className="notoserif bg-parchment dark:bg-darkbg min-h-screen">
      <PageHero
        title="You're Offline"
        description="This page isn't available offline."
        icon={mdiWifiOff}
        accentColor="stone"
      />

      <section className="py-12 md:py-16 px-6 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-charcoal dark:text-parchment leading-relaxed mb-8">
            The page you're trying to access hasn't been cached for offline use.
            You can access pages you've previously visited, or reconnect to the
            internet to continue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/" variant="primary">
              Go to Home
            </LinkButton>
            <LinkButton href="/character" variant="secondary">
              Character Manager
            </LinkButton>
            <LinkButton href="/tools" variant="secondary">
              Tools
            </LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OfflinePage;
