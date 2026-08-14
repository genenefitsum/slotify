import { Link } from 'react-router-dom';

import BackButton from '@/components/ui/back-button';

const sectionCardClass = 'rounded-2xl border border-border bg-card p-5 shadow-sm';

const TermsOfServicePage = () => {
	return (
		<section className="container mx-auto px-4 py-10 lg:py-14">
			<BackButton className="mb-4" fallbackTo="/" />

			<div className="section-shell p-6 sm:p-8 lg:p-10">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Terms of Service</p>
				<h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
					The rules for using Slotify’s marketplace
				</h1>
				<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
					These terms explain how Slotify works, what users and vendors are responsible for, and the limits that apply when you use the platform to discover and book services.
				</p>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">1. Acceptance</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						By accessing or using Slotify, you agree to these terms and to any policies referenced here. If you use the platform on behalf of a business or vendor account, you confirm that you are authorized to bind that entity.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">2. Eligibility and accounts</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						You must provide accurate registration information, keep your credentials secure, and notify us if you believe your account has been compromised. You may not use the service if you are prohibited from doing so by law.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">3. Marketplace role</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Slotify is a booking marketplace. We connect customers with independent vendors, but the actual service is provided by the vendor, not by Slotify. We do not guarantee that every listing, schedule, or service outcome will be error-free or available at all times.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">4. Bookings and cancellations</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						When you book a service, you agree to the date, time, location, and any special instructions shown at checkout. Customers and vendors are responsible for timely cancellation, rescheduling, and communication. Refunds, no-shows, and late cancellations may be handled according to the policy shown for the specific service or vendor.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-3">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">5. Payments and fees</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						If payments, commissions, deposits, or platform fees are enabled, you authorize Slotify and its payment partners to process the amounts shown during checkout. Any applicable taxes or third-party charges remain your responsibility unless stated otherwise.
					</p>
				</article>
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">6. Vendor responsibilities</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Vendors must keep their profiles, pricing, availability, and service descriptions accurate; deliver services with reasonable care; maintain any required licenses or permissions; and comply with applicable laws.
					</p>
				</article>
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">7. Reviews and content</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						You may submit reviews, photos, and other content if you have the rights to do so. Content must be truthful, respectful, and lawful. We may remove content that is abusive, misleading, or otherwise inconsistent with these terms.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">8. Prohibited conduct</p>
					<ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
						<li>• Do not impersonate others or misrepresent your identity.</li>
						<li>• Do not interfere with platform security or access controls.</li>
						<li>• Do not post unlawful, abusive, fraudulent, or harmful content.</li>
						<li>• Do not use Slotify to spam, scrape, or automate unauthorized activity.</li>
						<li>• Do not attempt to bypass fees, safety checks, or account restrictions.</li>
					</ul>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">9. Suspension and termination</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						We may suspend or terminate accounts that violate these terms, create risk for users or the platform, or are inactive for an extended period. You may stop using Slotify at any time, but some obligations and rights survive termination.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						We may also remove listings, content, or bookings when needed to protect the marketplace.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">10. Disputes and governing law</p>
					<h2 className="mt-2 text-lg font-semibold">How disputes are handled</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Before filing formal action, the parties should try to resolve disputes informally by contacting Slotify support. To the extent allowed by law, these terms are governed by the laws of Ethiopia, and the courts located in Addis Ababa, Ethiopia will have jurisdiction unless a different rule is required by law.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">11. Contact and updates</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						We may update these terms from time to time. If the changes are material, we will post an updated version on the site.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						Questions can be sent to{' '}
						<a href="mailto:slotifyethiopia@outlook.com?subject=Slotify%20Terms%20Inquiry" className="font-medium text-foreground hover:underline">
							slotifyethiopia@outlook.com
						</a>{' '}
						or Addis Ababa, Addis Ababa, Ethiopia.
					</p>
				</article>
			</div>

			<div className="mt-8 flex flex-wrap gap-3">
				<Link
					to="/privacy"
					className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Privacy policy
				</Link>
				<Link
					to="/cookies"
					className="inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
				>
					Cookie policy
				</Link>
			</div>
		</section>
	);
};

export default TermsOfServicePage;