import { Link } from 'react-router-dom';

import BackButton from '@/components/ui/back-button';

const sectionCardClass = 'rounded-2xl border border-border bg-card p-5 shadow-sm';

const CookiePolicyPage = () => {
	return (
		<section className="container mx-auto px-4 py-10 lg:py-14">
			<BackButton className="mb-4" fallbackTo="/" />

			<div className="section-shell relative overflow-hidden p-6 sm:p-8 lg:p-10">
				<div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />

				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Cookie Policy</p>
				<h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
					How Slotify uses cookies and similar technologies
				</h1>
				<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
					We use cookies and related technologies to keep you signed in, remember preferences, measure usage, and improve the marketplace experience.
				</p>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">What cookies are</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Cookies are small text files stored on your device when you visit a website. They help websites work more efficiently and help site owners understand how the service is being used.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Why we use them</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Slotify uses cookies for authentication, security, account preferences, analytics, and product performance. We may also use similar technologies such as pixels or local storage where needed to support these purposes.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-3">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Essential cookies</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						These are required for core site functions such as sign-in, session management, security, and basic page navigation. The site may not function properly without them.
					</p>
				</article>
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Preferences</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						These help remember your settings and make the experience more consistent across visits, such as saved state or layout preferences.
					</p>
				</article>
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Analytics and performance</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						We use analytics tools, including Google Analytics via our site tagging setup, to understand usage, measure page views, and improve performance.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Third-party cookies</p>
					<h2 className="mt-2 text-lg font-semibold">Google and other providers</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Some third-party tools may set cookies when you interact with Slotify, including Google services used for analytics or sign-in. Those providers control their own cookies and have their own privacy policies.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						If we introduce additional analytics, advertising, or support tools, we will update this policy to reflect them.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Managing cookies</p>
					<h2 className="mt-2 text-lg font-semibold">Your controls</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						You can manage cookies in your browser settings, delete stored cookies, or block them altogether. Some cookies are essential and cannot be disabled without affecting the service.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						If you disable analytics cookies, we may still be able to maintain the site, but our insight into product usage will be reduced.
					</p>
				</article>
			</div>

			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Updates</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						We may update this Cookie Policy from time to time if our use of cookies changes or if the law requires a revision. The latest version will always be posted here.
					</p>
				</article>

				<article className={sectionCardClass}>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Contact</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Questions about our cookie use can be sent to{' '}
						<a href="mailto:slotifyethiopia@outlook.com" className="font-medium text-foreground hover:underline">
							slotifyethiopia@outlook.com
						</a>{' '}
						or Addis Ababa, Addis Ababa, Ethiopia.
					</p>
					<p className="mt-3 text-sm leading-6 text-muted-foreground">Last updated: June 3, 2026.</p>
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
					to="/register"
					className="inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
				>
					Create account
				</Link>
			</div>
		</section>
	);
};

export default CookiePolicyPage;