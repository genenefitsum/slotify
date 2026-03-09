import { useMemo, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { HttpError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { requestGoogleCredential } from '@/lib/googleCredential';

const RegisterPage = () => {
	const { register, loginWithGoogle } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState<'customer' | 'vendor_owner'>('customer');
	const [error, setError] = useState('');
	const [googleError, setGoogleError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const redirectTo = useMemo(() => {
		const state = location.state as { from?: { pathname?: string } } | null;
		return state?.from?.pathname || '/';
	}, [location.state]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			await register({
				firstName,
				lastName,
				email,
				phone: phone || undefined,
				password,
				role,
			});
			navigate(redirectTo, { replace: true });
		} catch (submitError) {
			if (submitError instanceof HttpError) {
				setError(submitError.message);
			} else {
				setError('Registration failed. Please try again.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();

	const handleGoogleSignUp = async () => {
		setGoogleError('');

		try {
			const credential = await requestGoogleCredential(googleClientId);
			await loginWithGoogle({ credential, role });
			navigate(redirectTo, { replace: true });
		} catch (googleSignInError) {
			if (googleSignInError instanceof HttpError) {
				setGoogleError(googleSignInError.message);
				return;
			}

			if (googleSignInError instanceof Error) {
				setGoogleError(googleSignInError.message);
				return;
			}

			setGoogleError('Google sign-in failed. Please try again.');
		}
	};

	return (
		<section className="container mx-auto max-w-md px-4 py-14">
			<h1 className="text-3xl font-semibold">Create Account</h1>
			<p className="mt-3 text-muted-foreground">Join Slotify to book services or manage your vendor profile.</p>

			<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
				<div>
					<label htmlFor="firstName" className="mb-1 block text-sm font-medium">First Name</label>
					<input
						id="firstName"
						required
						className="w-full rounded-md border border-border bg-background px-3 py-2"
						value={firstName}
						onChange={(event) => setFirstName(event.target.value)}
					/>
				</div>

				<div>
					<label htmlFor="lastName" className="mb-1 block text-sm font-medium">Last Name</label>
					<input
						id="lastName"
						className="w-full rounded-md border border-border bg-background px-3 py-2"
						value={lastName}
						onChange={(event) => setLastName(event.target.value)}
					/>
				</div>

				<div>
					<label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
					<input
						id="email"
						type="email"
						required
						className="w-full rounded-md border border-border bg-background px-3 py-2"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</div>

				<div>
					<label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone (optional)</label>
					<input
						id="phone"
						className="w-full rounded-md border border-border bg-background px-3 py-2"
						value={phone}
						onChange={(event) => setPhone(event.target.value)}
					/>
				</div>

				<div>
					<label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
					<input
						id="password"
						type="password"
						required
						minLength={8}
						className="w-full rounded-md border border-border bg-background px-3 py-2"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</div>

				<div>
					<label htmlFor="role" className="mb-1 block text-sm font-medium">Account Type</label>
					<select
						id="role"
						className="w-full rounded-md border border-border bg-background px-3 py-2"
						value={role}
						onChange={(event) => setRole(event.target.value as 'customer' | 'vendor_owner')}
					>
						<option value="customer">Customer</option>
						<option value="vendor_owner">Vendor Owner</option>
					</select>
				</div>

				{error ? <p className="text-sm text-destructive">{error}</p> : null}

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? 'Creating account...' : 'Create Account'}
				</Button>
			</form>

			<div className="my-5 border-t border-border pt-5">
				<div className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">
					Or continue with
				</div>
				<Button
					type="button"
					variant="outline"
					className="mt-2 w-full"
					onClick={handleGoogleSignUp}
					disabled={isSubmitting}
				>
					<FcGoogle className="h-4 w-4" />
					Continue with Google
				</Button>

				{googleError ? <p className="mt-2 text-sm text-destructive">{googleError}</p> : null}
			</div>

			<p className="text-sm text-muted-foreground">
				Already have an account?{' '}
				<Link to="/login" className="text-primary hover:underline">
					Log in
				</Link>
			</p>
		</section>
	);
};

export default RegisterPage;
