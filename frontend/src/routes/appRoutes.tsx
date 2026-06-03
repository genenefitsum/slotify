import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from '@/contexts/AuthContext';
import AboutPage from "@/pages/AboutPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import CustomerBookingsPage from "@/pages/CustomerBookingsPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import RegisterPage from "@/pages/RegisterPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import VendorDashboardPage from "@/pages/VendorDashboardPage";
import VendorDetailPage from "@/pages/VendorDetailPage";
import VendorsPage from "@/pages/VendorsPage";
import type { UserRole } from '@/types/auth';
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

const RequireAuth = () => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<section className="container mx-auto px-4 py-14">
				<div className="section-shell p-6 text-sm text-muted-foreground">
					Checking your session and preparing your workspace...
				</div>
			</section>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />;
};

const RequireRole = ({ allowed }: { allowed: UserRole[] }) => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (!allowed.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

const AppRoutes = () => {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route path="/" element={<HomePage />} />
				<Route path="/vendors" element={<VendorsPage />} />
				<Route path="/vendor/:id" element={<VendorDetailPage />} />
				<Route path="/about" element={<AboutPage />} />
				<Route path="/privacy" element={<PrivacyPolicyPage />} />
				<Route path="/terms" element={<TermsOfServicePage />} />
				<Route path="/cookies" element={<CookiePolicyPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				<Route element={<RequireAuth />}>
					<Route element={<RequireRole allowed={['vendor_owner', 'vendor_staff']} />}>
						<Route path="/dashboard/vendor" element={<VendorDashboardPage />} />
					</Route>
					<Route element={<RequireRole allowed={['customer']} />}>
						<Route path="/bookings" element={<CustomerBookingsPage />} />
					</Route>
					<Route element={<RequireRole allowed={['admin']} />}>
						<Route path="/dashboard/admin" element={<AdminDashboardPage />} />
					</Route>
				</Route>

				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
};

export default AppRoutes;
