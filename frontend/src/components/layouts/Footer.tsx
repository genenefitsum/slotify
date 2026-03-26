import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="border-t border-border/60 bg-gradient-to-b from-card to-muted/20">
			<div className="container mx-auto px-4 py-10">
				<div className="grid gap-8 md:grid-cols-4">
					<div>
						<p className="text-lg font-bold tracking-tight">Slotify</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Book trusted professionals in minutes across Ethiopia.
						</p>
					</div>

					<div>
						<p className="text-sm font-semibold text-foreground">Platform</p>
						<div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
							<Link to="/vendors" className="hover:text-foreground">
								Browse Services
							</Link>
							<Link to="/register" className="hover:text-foreground">
								Become a Vendor
							</Link>
							<Link to="/about" className="hover:text-foreground">
								How It Works
							</Link>
						</div>
					</div>

					<div>
						<p className="text-sm font-semibold text-foreground">Company</p>
						<div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
							<Link to="/about" className="hover:text-foreground">
								About
							</Link>
							<a href="#" className="hover:text-foreground">
								Contact
							</a>
							<a href="#" className="hover:text-foreground">
								Careers
							</a>
						</div>
					</div>

					<div>
						<p className="text-sm font-semibold text-foreground">Account</p>
						<div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
							<Link to="/login" className="hover:text-foreground">
								Log In
							</Link>
							<Link to="/register" className="hover:text-foreground">
								Create Account
							</Link>
						</div>
					</div>
				</div>

				<p className="mt-10 text-xs text-muted-foreground">
					© 2026 Slotify. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
