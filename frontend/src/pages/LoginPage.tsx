import { useMemo, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { HttpError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { requestGoogleCredential } from '@/lib/googleCredential';

const LoginPage = () => {
	const { login, loginWithGoogle } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
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
			await login({ email, password });
			navigate(redirectTo, { replace: true });
		} catch (submitError) {
			if (submitError instanceof HttpError) {
				setError(submitError.message);
			} else {
				setError('Login failed. Please try again.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();

	const handleGoogleSignIn = async () => {
		setGoogleError('');

		try {
			const credential = await requestGoogleCredential(googleClientId);
			await loginWithGoogle({ credential });
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
			<h1 className="text-3xl font-semibold">Log In</h1>
			<p className="mt-3 text-muted-foreground">Sign in to continue booking and managing your account.</p>

			<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

				{error ? <p className="text-sm text-destructive">{error}</p> : null}

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? 'Signing in...' : 'Log In'}
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
					onClick={handleGoogleSignIn}
					disabled={isSubmitting}
				>
					<FcGoogle className="h-4 w-4" />
					Continue with Google
				</Button>

				{googleError ? <p className="mt-2 text-sm text-destructive">{googleError}</p> : null}
			</div>

			<p className="text-sm text-muted-foreground">
				No account yet?{' '}
				<Link to="/register" className="text-primary hover:underline">
					Create one
				</Link>
			</p>
		</section>
	);
};

export default LoginPage;
