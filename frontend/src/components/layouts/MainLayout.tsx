import { Outlet } from "react-router-dom";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

const MainLayout = () => {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
};

export default MainLayout;
