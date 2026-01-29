'use client';

import { useState } from 'react';
import { mdiSend } from '@mdi/js';
import Icon from '@mdi/react';
import StatusMessage from '@/app/components/common/StatusMessage';

interface FormData {
	name: string;
	email: string;
	subject: string;
	message: string;
	// Honeypot field - should remain empty
	website: string;
	// Privacy consent
	privacyConsent: boolean;
}

interface FormStatus {
	type: 'idle' | 'loading' | 'success' | 'error' | 'rate-limit';
	message?: string;
}

const ContactForm = ({ recipientEmail }: { recipientEmail?: string }) => {
	const [formData, setFormData] = useState<FormData>({
		name: '',
		email: '',
		subject: '',
		message: '',
		website: '',
		privacyConsent: false,
	});

	const [status, setStatus] = useState<FormStatus>({ type: 'idle' });

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Client-side honeypot check
		if (formData.website) {
			// Bot detected - silently "succeed" to not reveal the trap
			setStatus({ type: 'success', message: 'Your message has been sent!' });
			return;
		}

		if (!formData.privacyConsent) {
			setStatus({
				type: 'error',
				message: 'Please agree to the privacy policy to continue.',
			});
			return;
		}

		setStatus({ type: 'loading' });

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					subject: formData.subject,
					message: formData.message,
					website: formData.website,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setStatus({ type: 'success', message: 'Your message has been sent!' });
				setFormData({
					name: '',
					email: '',
					subject: '',
					message: '',
					website: '',
					privacyConsent: false,
				});
			} else if (response.status === 429) {
				// Rate limit hit
				setStatus({
					type: 'rate-limit',
					message: data.fallbackEmail
						? `We're experiencing high volume. Please email us directly at ${data.fallbackEmail}`
						: "We're experiencing high volume. Please try again later.",
				});
			} else {
				setStatus({
					type: 'error',
					message: data.error || 'Something went wrong. Please try again.',
				});
			}
		} catch {
			setStatus({
				type: 'error',
				message: 'Failed to send message. Please check your connection and try again.',
			});
		}
	};

	const inputClasses =
		'w-full px-4 py-3 border-2 border-stone bg-white dark:bg-darkbg dark:border-stone/50 focus:border-gold dark:focus:border-gold focus:outline-none transition-colors text-charcoal dark:text-parchment';
	const labelClasses =
		'block mb-2 text-sm uppercase tracking-wider text-stone dark:text-stone/80 marcellus';

	if (status.type === 'success') {
		return (
			<StatusMessage
				variant="success"
				size="full"
				title="Message Sent"
				message={status.message || 'Your message has been sent!'}
			>
				<button
					onClick={() => setStatus({ type: 'idle' })}
					className="text-gold hover:text-brightgold underline transition-colors"
				>
					Send another message
				</button>
			</StatusMessage>
		);
	}

	if (status.type === 'rate-limit') {
		return (
			<StatusMessage
				variant="warning"
				size="full"
				title="High Volume"
				message={status.message || "We're experiencing high volume. Please try again later."}
			>
				{recipientEmail && (
					<a
						href={`mailto:${recipientEmail}`}
						className="text-gold hover:text-brightgold underline transition-colors"
					>
						Email us directly
					</a>
				)}
			</StatusMessage>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Honeypot field - hidden from humans, bots will fill it */}
			<div className="absolute -left-[9999px]" aria-hidden="true">
				<label htmlFor="website">Website</label>
				<input
					type="text"
					id="website"
					name="website"
					value={formData.website}
					onChange={handleChange}
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div>
					<label htmlFor="name" className={labelClasses}>
						Name *
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						className={inputClasses}
						placeholder="Your name"
					/>
				</div>

				<div>
					<label htmlFor="email" className={labelClasses}>
						Email *
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						className={inputClasses}
						placeholder="your@email.com"
					/>
				</div>
			</div>

			<div>
				<label htmlFor="subject" className={labelClasses}>
					Subject *
				</label>
				<input
					type="text"
					id="subject"
					name="subject"
					value={formData.subject}
					onChange={handleChange}
					required
					className={inputClasses}
					placeholder="What is this regarding?"
				/>
			</div>

			<div>
				<label htmlFor="message" className={labelClasses}>
					Message *
				</label>
				<textarea
					id="message"
					name="message"
					value={formData.message}
					onChange={handleChange}
					required
					rows={6}
					className={`${inputClasses} resize-vertical`}
					placeholder="Your message..."
				/>
			</div>

			<div className="flex items-start gap-3">
				<input
					type="checkbox"
					id="privacyConsent"
					name="privacyConsent"
					checked={formData.privacyConsent}
					onChange={handleChange}
					className="mt-1 w-5 h-5 accent-gold"
				/>
				<label htmlFor="privacyConsent" className="text-sm text-stone dark:text-stone/80">
					I consent to having this website store my submitted information so they can
					respond to my inquiry. *
				</label>
			</div>

			{status.type === 'error' && (
				<StatusMessage variant="error" message={status.message || 'An error occurred.'} />
			)}

			<div>
				<button
					type="submit"
					disabled={status.type === 'loading'}
					className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black marcellus uppercase tracking-widest text-sm font-bold hover:bg-brightgold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Icon path={mdiSend} size={0.875} />
					{status.type === 'loading' ? 'Sending...' : 'Send Message'}
				</button>
			</div>
		</form>
	);
};

export default ContactForm;
