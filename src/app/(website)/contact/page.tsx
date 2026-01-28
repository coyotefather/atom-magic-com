import PageHero from '@/app/components/common/PageHero';
import ContactForm from '@/app/components/contact/ContactForm';
import { mdiEmail } from '@mdi/js';

export const metadata = {
	title: 'Contact | Atom Magic',
	description: 'Get in touch with the Atom Magic team.',
};

const Page = () => {
	const recipientEmail = process.env.CONTACT_EMAIL;

	return (
		<main className="notoserif bg-parchment dark:bg-darkbg min-h-screen">
			<PageHero
				title="Contact"
				description="Get in touch with us."
				icon={mdiEmail}
				accentColor="gold"
			/>

			<section className="py-12 md:py-16 px-6 md:px-8">
				<div className="max-w-2xl mx-auto">
					<div className="mb-8">
						<p className="text-charcoal dark:text-parchment leading-relaxed">
							Have a question, suggestion, or found a bug? We&apos;d love to hear from
							you. Fill out the form below and we&apos;ll get back to you as soon as
							possible.
						</p>
					</div>

					<ContactForm recipientEmail={recipientEmail} />

					<div className="mt-12 pt-8 border-t-2 border-stone/20">
						<p className="text-sm text-stone dark:text-stone/80">
							Your information is only used to respond to your inquiry and is never
							shared with third parties.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
};

export default Page;
