import { useMemo, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { HttpError } from '@/api/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

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
	const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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

	const handleGoogleSignUp = async (credential?: string) => {
		if (!credential) {
			setGoogleError('Google sign-in did not return a credential. Please try again.');
			return;
		}

		setGoogleError('');
		setIsGoogleSubmitting(true);

		try {
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
		} finally {
			setIsGoogleSubmitting(false);
		}
	};

	return (
		<section className="relative isolate overflow-hidden border-b bg-gradient-hero">
			<div className="pointer-events-none absolute left-0 top-12 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
			<div className="pointer-events-none absolute -right-16 bottom-12 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

			<div className="container mx-auto max-w-xl px-4 py-10 sm:px-6 lg:py-16">
				<div className="glass rounded-3xl border border-border/80 bg-card/90 p-6 shadow-card sm:p-8">
					<h2 className="text-2xl font-heading font-semibold">Create Account</h2>
					<p className="mt-2 text-sm text-muted-foreground">Set up your profile and start using Slotify today.</p>

					<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">First Name</label>
								<Input
									id="firstName"
									required
									placeholder="Abel"
									className="h-11 rounded-xl border-border/70 bg-background/80"
									value={firstName}
									onChange={(event) => setFirstName(event.target.value)}
								/>
							</div>
							<div>
								<label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">Last Name</label>
								<Input
									id="lastName"
									placeholder="Tadesse"
									className="h-11 rounded-xl border-border/70 bg-background/80"
									value={lastName}
									onChange={(event) => setLastName(event.target.value)}
								/>
							</div>
						</div>

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
							<label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone (optional)</label>
							<Input
								id="phone"
								placeholder="+251..."
								className="h-11 rounded-xl border-border/70 bg-background/80"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
							/>
						</div>

						<div>
							<label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
							<Input
								id="password"
								type="password"
								required
								minLength={8}
								placeholder="Minimum 8 characters"
								className="h-11 rounded-xl border-border/70 bg-background/80"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>

						<div>
							<label htmlFor="role" className="mb-1.5 block text-sm font-medium">Account Type</label>
							<select
								id="role"
								className="h-11 w-full rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								value={role}
								onChange={(event) => setRole(event.target.value as 'customer' | 'vendor_owner')}
							>
								<option value="customer">Customer</option>
								<option value="vendor_owner">Vendor Owner</option>
							</select>
						</div>

						{error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

						<Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
							{isSubmitting ? 'Creating account...' : 'Create Account'}
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
										void handleGoogleSignUp(response.credential);
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

						{googleError ? <p className="mt-2 text-sm text-destructive">{googleError}</p> : null}
					</div>

					<p className="text-sm text-muted-foreground">
						Already have an account?{' '}
						<Link to="/login" className="font-medium text-primary hover:underline">
							Log in
						</Link>
					</p>
				</div>
			</div>
		</section>
	);
};

export default RegisterPage;
