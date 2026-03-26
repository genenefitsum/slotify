import { Link } from 'react-router-dom';

import BackButton from '@/components/ui/back-button';

const AboutPage = () => {
	return (
		<section className="container mx-auto px-4 py-10 lg:py-14">
			<BackButton className="mb-4" fallbackTo="/" />

			<div className="section-shell relative overflow-hidden p-6 sm:p-8 lg:p-10">
				<div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-12 bottom-0 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />

				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About Slotify</p>
				<h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
					A booking marketplace designed for clarity and trust
				</h1>
				<p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
					Slotify helps customers discover, compare, and book trusted professionals across Ethiopia.
					From first search to final appointment, each step is built around transparent pricing,
					clear service details, and reliable scheduling.
				</p>

				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						to="/vendors"
						className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Browse vendors
					</Link>
					<Link
						to="/register"
						className="inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
					>
						Create account
					</Link>
				</div>
			</div>

			<div className="mt-8 grid gap-4 md:grid-cols-3">
				<article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Step 1</p>
					<h2 className="mt-2 text-lg font-semibold">Discover</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Browse vendors by city and category, compare profiles, and shortlist professionals that fit your needs.
					</p>
				</article>
				<article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Step 2</p>
					<h2 className="mt-2 text-lg font-semibold">Book</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Select a service, choose your preferred time slot, and share notes so vendors can prepare in advance.
					</p>
				</article>
				<article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Step 3</p>
					<h2 className="mt-2 text-lg font-semibold">Manage</h2>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						Track statuses in your dashboard, handle updates quickly, and leave reviews after completed appointments.
					</p>
				</article>
			</div>

			<div className="section-shell mt-8 bg-gradient-to-br from-card via-card to-muted/40 p-6">
				<h2 className="text-xl font-semibold">Trust and transparency by default</h2>
				<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<p className="rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
						Clear pricing and service duration are visible before booking.
					</p>
					<p className="rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
						Role-based dashboards keep customer, vendor, and admin workflows clean.
					</p>
					<p className="rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
						Post-service reviews help future customers make better choices.
					</p>
				</div>
			</div>
		</section>
	);
};

export default AboutPage;
