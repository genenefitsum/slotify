import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authApi } from '@/api/auth.api';
import { HttpError } from '@/api/http';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PASSWORD_PATTERN, PASSWORD_POLICY_MESSAGE, getPasswordError } from '@/lib/password';

type Step = 'request' | 'reset';

const getErrorMessage = (error: unknown, fallback: string) =>
	error instanceof HttpError || error instanceof Error ? error.message : fallback;

const ForgotPasswordPage = () => {
	const navigate = useNavigate();
	const [step, setStep] = useState<Step>('request');
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [notice, setNotice] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const sendCode = async () => {
		const response = await authApi.forgotPassword({ email: email.trim() });
		setNotice(response.message);
	};

	const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			await sendCode();
			setStep('reset');
		} catch (submitError) {
			setError(getErrorMessage(submitError, 'Could not send a reset code. Please try again.'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');

		const passwordError = getPasswordError(newPassword);
		if (passwordError) {
			setError(passwordError);
			return;
		}

		setIsSubmitting(true);

		try {
			await authApi.resetPassword({ email: email.trim(), code: code.trim(), newPassword });
			navigate('/login', {
				replace: true,
				state: { resetSuccess: 'Password updated. Sign in with your new password.' },
			});
		} catch (submitError) {
			setError(getErrorMessage(submitError, 'Could not reset your password. Please try again.'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResend = async () => {
		setError('');
		try {
			await sendCode();
		} catch (submitError) {
			setError(getErrorMessage(submitError, 'Could not resend the code. Please try again.'));
		}
	};

	return (
		<section className="border-b bg-background">
			<div className="container mx-auto max-w-xl px-4 py-10 sm:px-6 lg:py-16">
				<BackButton className="mb-4" fallbackTo="/login" />

				<div className="motion-enter glass section-shell border-border/80 bg-card/90 p-6 sm:p-8">
					<h2 className="text-2xl font-heading font-semibold">Reset your password</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						{step === 'request'
							? 'Enter your email and we’ll send you a 6-digit reset code.'
							: 'Enter the code we emailed you and choose a new password.'}
					</p>

					{step === 'request' ? (
						<form className="mt-6 space-y-4" onSubmit={handleRequest}>
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

							{error ? (
								<p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" aria-live="polite">
									{error}
								</p>
							) : null}

							<Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
								{isSubmitting ? 'Sending code...' : 'Send reset code'}
							</Button>
						</form>
					) : (
						<form className="mt-6 space-y-4" onSubmit={handleReset}>
							{notice ? (
								<p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground" aria-live="polite">
									{notice}
								</p>
							) : null}

							<div>
								<label htmlFor="code" className="mb-1.5 block text-sm font-medium">Reset code</label>
								<Input
									id="code"
									inputMode="numeric"
									autoComplete="one-time-code"
									required
									maxLength={6}
									placeholder="123456"
									className="h-11 rounded-xl border-border/70 bg-background/80 tracking-[0.4em]"
									value={code}
									onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
								/>
							</div>

							<div>
								<label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium">New password</label>
								<Input
									id="newPassword"
									type="password"
									required
									minLength={8}
									pattern={PASSWORD_PATTERN}
									title={PASSWORD_POLICY_MESSAGE}
									placeholder="Enter a new password"
									className="h-11 rounded-xl border-border/70 bg-background/80"
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
								/>
								<p className="mt-1 text-xs text-muted-foreground">{PASSWORD_POLICY_MESSAGE}</p>
							</div>

							{error ? (
								<p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" aria-live="polite">
									{error}
								</p>
							) : null}

							<Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
								{isSubmitting ? 'Updating password...' : 'Update password'}
							</Button>

							<div className="flex items-center justify-between text-sm">
								<button
									type="button"
									className="text-muted-foreground hover:underline"
									onClick={() => {
										setStep('request');
										setCode('');
										setError('');
									}}
								>
									Change email
								</button>
								<button type="button" className="font-medium text-primary hover:underline" onClick={handleResend}>
									Resend code
								</button>
							</div>
						</form>
					)}

					<p className="mt-5 border-t border-border/70 pt-5 text-sm text-muted-foreground">
						Remembered it?{' '}
						<Link to="/login" className="font-medium text-primary hover:underline">
							Back to sign in
						</Link>
					</p>
				</div>
			</div>
		</section>
	);
};

export default ForgotPasswordPage;
