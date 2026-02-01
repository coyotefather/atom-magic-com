import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend - will gracefully handle missing API key
const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

// Simple in-memory rate limiting (resets on server restart)
// For production at scale, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max submissions per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return false;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return true;
	}

	record.count++;
	return false;
}

// Cleanup old entries periodically (basic memory management)
setInterval(() => {
	const now = Date.now();
	for (const [ip, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(ip);
		}
	}
}, RATE_LIMIT_WINDOW);

export async function POST(request: NextRequest) {
	try {
		// Get client IP for rate limiting
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0] ||
			request.headers.get('x-real-ip') ||
			'unknown';

		// Check rate limit
		if (isRateLimited(ip)) {
			return NextResponse.json(
				{
					error: 'Too many requests. Please try again later.',
					fallbackEmail: process.env.CONTACT_EMAIL,
				},
				{ status: 429 }
			);
		}

		const body = await request.json();
		const { name, email, subject, message, website } = body;

		// Honeypot check - if filled, it's likely a bot
		if (website) {
			// Return success to not reveal the trap, but don't send email
			return NextResponse.json({ success: true });
		}

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return NextResponse.json(
				{ error: 'All fields are required.' },
				{ status: 400 }
			);
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Please provide a valid email address.' },
				{ status: 400 }
			);
		}

		// HTML escape function for safe email content
		const escapeHtml = (str: string): string =>
			str
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#039;')
				.trim()
				.slice(0, 5000);

		const sanitizedName = escapeHtml(name);
		const sanitizedSubject = escapeHtml(subject);
		const sanitizedMessage = escapeHtml(message);
		const sanitizedEmail = escapeHtml(email);

		// Check if Resend is configured
		if (!resend) {
			console.error('RESEND_API_KEY is not configured');
			return NextResponse.json(
				{
					error: 'Email service is not configured.',
					fallbackEmail: process.env.CONTACT_EMAIL,
				},
				{ status: 500 }
			);
		}

		const recipientEmail = process.env.CONTACT_EMAIL;
		if (!recipientEmail) {
			console.error('CONTACT_EMAIL is not configured');
			return NextResponse.json(
				{ error: 'Contact email is not configured.' },
				{ status: 500 }
			);
		}

		// Send email via Resend
		const { error } = await resend.emails.send({
			from: 'Atom Magic Contact <form@contact.atom-magic.com>', // Use your verified domain in production
			to: recipientEmail,
			replyTo: email, // Original email for reply-to (validated by regex)
			subject: `[Contact Form] ${sanitizedSubject}`,
			text: `Name: ${sanitizedName}\nEmail: ${email}\n\nMessage:\n${sanitizedMessage}`,
			html: `
				<h2>New Contact Form Submission</h2>
				<p><strong>Name:</strong> ${sanitizedName}</p>
				<p><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
				<p><strong>Subject:</strong> ${sanitizedSubject}</p>
				<hr />
				<p><strong>Message:</strong></p>
				<p style="white-space: pre-wrap;">${sanitizedMessage}</p>
			`,
		});

		if (error) {
			console.error('Resend error:', error);

			// Check if it's a rate limit error from Resend
			if (
				error.message?.includes('rate limit') ||
				error.message?.includes('quota')
			) {
				return NextResponse.json(
					{
						error: "We're experiencing high volume. Please try again later.",
						fallbackEmail: process.env.CONTACT_EMAIL,
					},
					{ status: 429 }
				);
			}

			return NextResponse.json(
				{ error: 'Failed to send message. Please try again.' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Contact form error:', error);
		return NextResponse.json(
			{ error: 'An unexpected error occurred.' },
			{ status: 500 }
		);
	}
}
