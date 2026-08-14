import { Link } from 'react-router-dom';

const NotFoundPage = () => {
	return (
		<section className="container mx-auto px-4 py-12 lg:py-16">
			<div className="section-shell mx-auto max-w-3xl p-8 text-center sm:p-10">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">404 Error</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">This page took a wrong turn</h1>
				<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
					The page you are looking for does not exist, may have moved, or might only be available to a different account role.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Link
						to="/"
						className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Back to home
					</Link>
					<Link
						to="/vendors"
						className="inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
					>
						Browse vendors
					</Link>
				</div>
			</div>
		</section>
	);
};

export default NotFoundPage;
