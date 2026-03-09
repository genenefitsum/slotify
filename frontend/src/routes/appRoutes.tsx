import MainLayout from "@/components/layouts/MainLayout";
import AboutPage from "@/pages/AboutPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import CustomerBookingsPage from "@/pages/CustomerBookingsPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import RegisterPage from "@/pages/RegisterPage";
import VendorDashboardPage from "@/pages/VendorDashboardPage";
import VendorDetailPage from "@/pages/VendorDetailPage";
import VendorsPage from "@/pages/VendorsPage";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

const hasAuthToken = () => Boolean(localStorage.getItem("slotify_token"));

const VendorProtectedRoute = () => {
	if (!hasAuthToken()) {
		return <Navigate to="/login" replace />;
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
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				<Route element={<VendorProtectedRoute />}>
					<Route path="/dashboard/vendor" element={<VendorDashboardPage />} />
					<Route path="/bookings" element={<CustomerBookingsPage />} />
					<Route path="/dashboard/admin" element={<AdminDashboardPage />} />
				</Route>

				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
};

export default AppRoutes;
