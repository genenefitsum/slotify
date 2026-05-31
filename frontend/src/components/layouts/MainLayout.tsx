import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import { trackPageView } from "@/lib/analytics";

const MainLayout = () => {
	const location = useLocation();
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		trackPageView(`${location.pathname}${location.search}${location.hash}`);
	}, [location.hash, location.pathname, location.search]);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header />
			<main className="relative">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default MainLayout;
