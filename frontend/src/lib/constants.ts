export type NavLinkItem = {
	label: string;
	to: string;
};

export type HowItWorksStep = {
	id: number;
	title: string;
	description: string;
};

export type VendorPreview = {
	id: number;
	name: string;
	category: string;
	rating: number;
	reviews: number;
	location: string;
	startingPrice: number;
	imageUrl: string;
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

export const FEATURED_VENDORS: VendorPreview[] = [
	{
		id: 1,
		name: "Dr. Abebe Tadesse",
		category: "Healthcare",
		rating: 4.9,
		reviews: 128,
		location: "Addis Ababa",
		startingPrice: 500,
		imageUrl:
			"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop",
	},
	{
		id: 2,
		name: "Selam Beauty Salon",
		category: "Beauty",
		rating: 4.7,
		reviews: 95,
		location: "Bole, Addis Ababa",
		startingPrice: 300,
		imageUrl:
			"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
	},
	{
		id: 3,
		name: "Dawit Auto Care",
		category: "Automotive",
		rating: 4.5,
		reviews: 67,
		location: "Megenagna, Addis Ababa",
		startingPrice: 800,
		imageUrl:
			"https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&h=600&fit=crop",
	},
	{
		id: 4,
		name: "Hanna Fitness Studio",
		category: "Fitness",
		rating: 4.8,
		reviews: 112,
		location: "Kazanchis, Addis Ababa",
		startingPrice: 250,
		imageUrl:
			"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
	},
	{
		id: 5,
		name: "Solomon Legal Consultancy",
		category: "Legal",
		rating: 4.6,
		reviews: 43,
		location: "Piazza, Addis Ababa",
		startingPrice: 1500,
		imageUrl:
			"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
	},
	{
		id: 6,
		name: "Tigist Photography",
		category: "Photography",
		rating: 4.9,
		reviews: 87,
		location: "Sarbet, Addis Ababa",
		startingPrice: 3000,
		imageUrl:
			"https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop",
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
