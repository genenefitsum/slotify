import { Link } from 'react-router-dom';

import BackButton from '@/components/ui/back-button';

const sectionCardClass = 'rounded-2xl border border-border bg-card p-5 shadow-sm';

const PrivacyPolicyPage = () => {
	return (
		<section className="container mx-auto px-4 py-10 lg:py-14">
			<BackButton className="mb-4" fallbackTo="/" />

			<div className="section-shell relative overflow-hidden p-6 sm:p-8 lg:p-10">
				<div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />

				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Privacy Policy</p>
				<h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
					How Slotify collects, uses, and protects your information
				</h1>
				<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
					This policy explains what we collect when you use Slotify, why we collect it, and how you can manage your privacy rights. It applies to customers, vendors, and visitors who use our website and booking services.
				</p>

				<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div className={sectionCardClass}>
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Collect</p>
						<p className="mt-2 text-sm text-muted-foreground">Account, booking, communication, and device data.</p>
					</div>
					<div className={sectionCardClass}>
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Use</p>
						<p className="mt-2 text-sm text-muted-foreground">Authentication, scheduling, support, analytics, and security.</p>
					</div>
					<div className={sectionCardClass}>
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Share</p>
						<p className="mt-2 text-sm text-muted-foreground">Only with vendors, service providers, and legal obligations where needed.</p>
					</div>
					<div className={sectionCardClass}>
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Control</p>
						<p className="mt-2 text-sm text-muted-foreground">Review, update, and request deletion where law allows.</p>
					</div>
				</div>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">1. Information we collect</p>
					<h2 className="mt-2 text-lg font-semibold">Information you provide</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						When you create an account, book a service, contact support, leave a review, or otherwise interact with Slotify, we may collect your name, email address, phone number, password, account role, booking details, messages, and any content you submit.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						If you sign in with Google, we may receive basic profile information from Google that is necessary to create or link your account.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">2. Automatically collected data</p>
					<h2 className="mt-2 text-lg font-semibold">Usage and device information</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						When you use our website, we may automatically collect IP address, browser type, device identifiers, operating system, pages viewed, timestamps, referral information, and other technical logs used to operate and secure the service.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						We also use cookies and similar technologies for authentication, preferences, analytics, and basic site functionality. See our Cookie Policy for details.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">3. How we use information</p>
					<h2 className="mt-2 text-lg font-semibold">Core purposes</h2>
					<ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
						<li>• Create and manage user accounts.</li>
						<li>• Process bookings, schedule appointments, and send updates.</li>
						<li>• Support vendor operations and marketplace administration.</li>
						<li>• Send service messages, confirmations, and important notices.</li>
						<li>• Detect fraud, prevent abuse, and maintain security.</li>
						<li>• Analyze usage and improve product performance.</li>
					</ul>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">4. Sharing and disclosure</p>
					<h2 className="mt-2 text-lg font-semibold">When we may share data</h2>
					<ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
						<li>• With vendors so they can fulfill booking requests.</li>
						<li>• With service providers that help us run payments, hosting, analytics, or support.</li>
						<li>• If required by law, legal process, or to protect rights and safety.</li>
						<li>• In connection with a merger, acquisition, or similar business transfer.</li>
					</ul>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-3">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">5. Retention</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						We keep personal information only as long as needed for the purposes described in this policy, to comply with legal obligations, resolve disputes, and enforce agreements.
					</p>
				</article>
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">6. Security</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						We use reasonable administrative, technical, and organizational safeguards to protect your data, but no online system can be guaranteed completely secure.
					</p>
				</article>
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">7. Minors</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Slotify is intended for users who can form a binding agreement and we do not knowingly collect data from children under 18.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">8. Your rights</p>
					<h2 className="mt-2 text-lg font-semibold">Access, correction, and deletion</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Depending on where you live, you may have rights to access, correct, delete, or restrict the use of your personal information. You may also be able to withdraw consent where we rely on consent as the legal basis for processing.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						You can contact us to exercise these rights, and we will review requests in line with applicable law.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">9. Contact</p>
					<h2 className="mt-2 text-lg font-semibold">How to reach us</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						For privacy questions or requests, contact Slotify at{' '}
						<a href="mailto:slotifyethiopia@outlook.com?subject=Slotify%20Privacy%20Inquiry" className="font-medium text-foreground hover:underline">
							slotifyethiopia@outlook.com
						</a>{' '}
						or write to Addis Ababa, Addis Ababa, Ethiopia.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						Last updated: June 3, 2026.
					</p>
				</article>
			</div>

			<div className="mt-8 flex flex-wrap gap-3">
				<Link
					to="/terms"
					className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Read terms
				</Link>
				<Link
					to="/cookies"
					className="inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
				>
					Cookie details
				</Link>
			</div>
		</section>
	);
};

export default PrivacyPolicyPage;