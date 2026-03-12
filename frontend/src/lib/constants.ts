export type NavLinkItem = {
	label: string;
	to: string;
};

export type HowItWorksStep = {
	id: number;
	title: string;
	description: string;
};

export type Testimonial = {
	quote: string;
	name: string;
	role: "Customer" | "Vendor";
};

export const NAV_LINKS: NavLinkItem[] = [
	{ label: "Browse Vendors", to: "/vendors" },
	{ label: "How It Works", to: "/about" },
	{ label: "Log In", to: "/login" },
];

export const HERO_STATS = [
	"500+ Vendors",
	"10K+ Bookings",
	"4.8 Rating",
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
	{
		id: 1,
		title: "Discover",
		description:
			"Browse trusted service providers across categories and locations in Ethiopia.",
	},
	{
		id: 2,
		title: "Book",
		description:
			"Select a convenient time slot and book your appointment instantly.",
	},
	{
		id: 3,
		title: "Get Service",
		description:
			"Show up at your scheduled time and enjoy professional service.",
	},
];

export const TESTIMONIALS: Testimonial[] = [
	{
		quote:
			"Slotify made it so easy to find and book a reliable doctor. The whole process took less than 2 minutes!",
		name: "Meron Hailu",
		role: "Customer",
	},
	{
		quote:
			"As a vendor, Slotify has helped me grow my business by 40%. The booking system is seamless.",
		name: "Yonas Bekele",
		role: "Vendor",
	},
	{
		quote:
			"I love how I can compare different service providers and read real reviews before booking.",
		name: "Sara Mengistu",
		role: "Customer",
	},
];

export const ADDITIONAL_LINKS: NavLinkItem[] = [
	{ label: "Browse Vendors", to: "/vendors" },
	{ label: "How It Works", to: "/about" },
	{ label: "Log In", to: "/login" },
	{ label: "Get Started", to: "/register" },
];
