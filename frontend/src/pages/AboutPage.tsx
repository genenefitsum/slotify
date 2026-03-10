const AboutPage = () => {
	return (
		<section className="container mx-auto px-4 py-14">
			<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
				About Slotify
			</p>
			<h1 className="mt-3 text-3xl font-semibold">How Slotify Works</h1>
			<p className="mt-4 max-w-3xl text-muted-foreground">
				Slotify helps customers discover, compare, and book trusted professionals across
				Ethiopia. Every step is built around clarity: what a service includes, when it is
				available, and what you will pay.
			</p>

			<div className="mt-8 grid gap-4 md:grid-cols-3">
				<article className="rounded-xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">1. Discover</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Browse vendors by category and city, compare profiles, and shortlist providers that
						match your expectations.
					</p>
				</article>
				<article className="rounded-xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">2. Book</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Select a service, choose your preferred date and time, and submit booking notes so
						the vendor can prepare.
					</p>
				</article>
				<article className="rounded-xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">3. Manage</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Track booking status changes, cancel when needed, and leave reviews after completed
						appointments.
					</p>
				</article>
			</div>

			<div className="mt-8 rounded-xl border border-border bg-card p-6">
				<h2 className="text-xl font-semibold">Trust and Transparency</h2>
				<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
					<li>Clear service pricing and duration before booking.</li>
					<li>Role-based dashboards for customers, vendors, and admins.</li>
					<li>Post-service reviews that help future customers choose confidently.</li>
				</ul>
			</div>
		</section>
	);
};

export default AboutPage;
