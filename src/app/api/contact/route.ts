/**
 * contact/route.ts
 *
 * API route handler for the site's contact form submissions.
 *
 * This endpoint receives form data from the contact page, validates it,
 * and sends an email using Resend (an external email delivery service).
 *
 * Security layers (in order):
 *
 *   1. Rate limiting — Tracks submissions by IP address. Allows a maximum of
 *      5 submissions per IP per hour. Uses an in-memory Map (simple, no
 *      infrastructure needed, but resets on server restart). For a higher-traffic
 *      site, this should be replaced with Redis or a similar persistent store.
 *
 *   2. Honeypot field — The form has a hidden `website` field that real users
 *      never fill in, but bots often do. If `website` is non-empty, we silently
 *      return success (so the bot doesn't know it was rejected) without sending
 *      any email.
 *
 *   3. Field validation — All four required fields (name, email, subject, message)
 *      must be present. Email is checked against a basic format regex.
 *
 *   4. HTML sanitization — All user-provided strings are HTML-escaped before
 *      being embedded in the email HTML body. This prevents XSS if the email
 *      client renders the HTML in an unexpected way. Strings are also capped at
 *      5000 characters to prevent oversized payloads.
 *
 * Email delivery:
 *   Sent via Resend (resend.com). Requires the `RESEND_API_KEY` environment
 *   variable. The "from" address uses a custom verified domain
 *   (`contact.atom-magic.com`). The `replyTo` header is set to the form
 *   submitter's email so replying to the email goes directly to them.
 *
 *   If `RESEND_API_KEY` is not set (e.g., in local development), the endpoint
 *   returns a 500 with a `fallbackEmail` field containing the `CONTACT_EMAIL`
 *   env var — the frontend can use this to show a "please email us directly" message.
 *
 * Environment variables required:
 *   - `RESEND_API_KEY`  — Resend API key for email delivery
 *   - `CONTACT_EMAIL`   — The recipient address for incoming contact form emails
 *
 * Only accepts POST. Returns:
 *   - 200 `{ success: true }` on success
 *   - 400 `{ error: string }` on validation failure
 *   - 429 `{ error: string, fallbackEmail: string }` on rate limit exceeded
 *   - 500 `{ error: string, fallbackEmail?: string }` on server/config error
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend at module load time. If the API key isn't present (local dev or
// misconfigured deployment), resend is null and the POST handler returns a 500.
const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

// ─── Rate limiting ──────────────────────────────────────────────────────────────
// In-memory rate limiter. Simple and requires no external infrastructure.
// Limitation: the Map is per-process — if the server restarts or scales to multiple
// instances, limits reset. For scale, use Redis or a Vercel KV store instead.

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/** Maximum form submissions allowed per IP within the rate limit window. */
const RATE_LIMIT_MAX = 5;

/** How long (in ms) before the submission counter resets for a given IP. (1 hour) */
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

/**
 * Checks whether the given IP has exceeded the submission limit.
 * If not over limit, increments the counter and returns false.
 * If over limit, returns true without incrementing.
 */
function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(ip);

	if (!record || now > record.resetTime) {
		// First submission in this window — start a new counter
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return false;
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return true;
	}

	record.count++;
	return false;
}

// Clean up expired entries once per rate limit window to prevent unbounded memory growth.
// Each interval pass removes any IP whose window has already expired.
setInterval(() => {
	const now = Date.now();
	for (const [ip, record] of rateLimitMap.entries()) {
		if (now > record.resetTime) {
			rateLimitMap.delete(ip);
		}
	}
}, RATE_LIMIT_WINDOW);

// ─── POST handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
	try {
		// Extract IP for rate limiting.
		// `x-forwarded-for` is set by Vercel and most proxies.
		// It can be a comma-separated list; take the first (leftmost) value = original client IP.
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0] ||
			request.headers.get('x-real-ip') ||
			'unknown';

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

		// Honeypot: `website` is a hidden field not visible to real users.
		// Real users never fill it in; bots often do. Return a fake success so
		// the bot doesn't know it was caught.
		if (website) {
			return NextResponse.json({ success: true });
		}

		// All four visible fields are required
		if (!name || !email || !subject || !message) {
			return NextResponse.json(
				{ error: 'All fields are required.' },
				{ status: 400 }
			);
		}

		// Basic email format check (not exhaustive, but catches obvious mistakes)
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Please provide a valid email address.' },
				{ status: 400 }
			);
		}

		// Escape HTML special characters to prevent XSS if the email client
		// renders HTML bodies in an unexpected context. Also strips leading/trailing
		// whitespace and caps length to prevent oversized payloads.
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

		const { error } = await resend.emails.send({
			from: 'Atom Magic Contact <form@contact.atom-magic.com>',
			to: recipientEmail,
			// replyTo uses the original (unsanitized but regex-validated) email
			// so the recipient can reply directly to the sender.
			replyTo: email,
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

			// Distinguish Resend rate limit errors from general failures so the
			// frontend can show a more helpful message ("try again later" vs "it broke")
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
