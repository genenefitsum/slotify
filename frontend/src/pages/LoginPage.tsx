import { useMemo, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { HttpError } from '@/api/http';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleRedirectPath } from '@/lib/authRedirect';

const LoginPage = () => {
	const { login, loginWithGoogle } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [googleError, setGoogleError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

	const redirectTo = useMemo(() => {
		const state = location.state as { from?: { pathname?: string } } | null;
		return state?.from?.pathname || '';
	}, [location.state]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			const authenticatedUser = await login({ email, password });
			const target = (redirectTo && redirectTo !== '/' && redirectTo !== '/login')
				? redirectTo
				: getRoleRedirectPath(authenticatedUser.role);
			navigate(target, { replace: true });
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

	const handleGoogleSuccess = async (credential?: string) => {
		if (!credential) {
			setGoogleError('Google sign-in did not return a credential. Please try again.');
			return;
		}

		setGoogleError('');
		setIsGoogleSubmitting(true);

		try {
			const authenticatedUser = await loginWithGoogle({ credential });
			const target = (redirectTo && redirectTo !== '/' && redirectTo !== '/login')
				? redirectTo
				: getRoleRedirectPath(authenticatedUser.role);
			navigate(target, { replace: true });
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
		} finally {
			setIsGoogleSubmitting(false);
		}
	};

	return (
		<section className="relative isolate overflow-hidden border-b bg-gradient-hero">
			<div className="pointer-events-none absolute -left-20 top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

			<div className="container mx-auto max-w-xl px-4 py-10 sm:px-6 lg:py-16">
				<BackButton className="mb-4" fallbackTo="/" />

				<div className="motion-enter glass section-shell border-border/80 bg-card/90 p-6 sm:p-8">
					<h2 className="text-2xl font-heading font-semibold">Log In</h2>
					<p className="mt-2 text-sm text-muted-foreground">Welcome back. Pick up exactly where you left off.</p>

					<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
						<div>
							<label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
							<Input
								id="email"
								type="email"
								required
								placeholder="you@example.com"
								className="h-11 rounded-xl border-border/70 bg-background/80"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>

						<div>
							<label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
							<Input
								id="password"
								type="password"
								required
								minLength={8}
								placeholder="Enter your password"
								className="h-11 rounded-xl border-border/70 bg-background/80"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
							<p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters.</p>
						</div>

						{error ? (
							<p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" aria-live="polite">
								{error}
							</p>
						) : null}

						<Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
							{isSubmitting ? 'Signing you in...' : 'Continue'}
						</Button>
					</form>

					<div className="my-5 border-t border-border/70 pt-5">
						<div className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">
							Or continue with
						</div>

						{googleClientId ? (
							<div className="mt-3 flex justify-center" aria-busy={isGoogleSubmitting}>
								<GoogleLogin
									onSuccess={(response) => {
										void handleGoogleSuccess(response.credential);
									}}
									onError={() => {
										setGoogleError('Google sign-in was cancelled or blocked. Please try again.');
									}}
									shape="pill"
									size="large"
									text="continue_with"
									useOneTap={false}
								/>
							</div>
						) : (
							<Button type="button" variant="outline" className="mt-2 h-11 w-full rounded-xl" disabled>
								<FcGoogle className="h-4 w-4" />
								Google sign-in unavailable
							</Button>
						)}

						{!googleClientId ? (
							<p className="mt-2 text-xs text-muted-foreground">
								Google sign-in is disabled in this environment. Use email and password to continue.
							</p>
						) : null}

						{googleError ? <p className="mt-2 text-sm text-destructive" role="alert" aria-live="polite">{googleError}</p> : null}
					</div>

					<p className="text-sm text-muted-foreground">
						No account yet?{' '}
						<Link to="/register" className="font-medium text-primary hover:underline">
							Create an account
						</Link>
					</p>
				</div>
			</div>
		</section>
	);
};

export default LoginPage;
