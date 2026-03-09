import { Link } from "react-router-dom";

const NotFoundPage = () => {
	return (
		<section className="container mx-auto px-4 py-16 text-center">
			<p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
				404
			</p>
			<h1 className="mt-3 text-4xl">Page Not Found</h1>
			<p className="mx-auto mt-3 max-w-xl text-muted-foreground">
				The page you are looking for does not exist or has been moved.
			</p>
			<Link
				to="/"
				className="mt-8 inline-block rounded-xl bg-primary px-5 py-2 text-sm text-primary-foreground"
			>
				Back to Home
			</Link>
		</section>
	);
};

export default NotFoundPage;
