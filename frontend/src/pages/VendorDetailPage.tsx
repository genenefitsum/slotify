import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useParams } from "react-router-dom";
import { useLocation, useNavigate } from 'react-router-dom';

const VendorDetailPage = () => {
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [actionMessage, setActionMessage] = useState('');

	const ensureSignedIn = () => {
		if (isAuthenticated) {
			return true;
		}

		navigate('/login', { state: { from: location } });
		return false;
	};

	return (
		<section className="container mx-auto px-4 py-14">
			<h1 className="text-3xl">Vendor Profile</h1>
			<p className="mt-3 text-muted-foreground">
				Detail page for vendor <span className="font-semibold">{id}</span> will be
				implemented in the next phase.
			</p>

			<div className="mt-6 flex gap-3">
				<Button
					onClick={() => {
						if (ensureSignedIn()) {
							setActionMessage('Booking flow is next in implementation.');
						}
					}}
				>
					Book Now
				</Button>
				<Button
					variant="outline"
					onClick={() => {
						if (ensureSignedIn()) {
							setActionMessage('Review flow is next in implementation.');
						}
					}}
				>
					Write Review
				</Button>
			</div>

			{actionMessage ? <p className="mt-3 text-sm text-muted-foreground">{actionMessage}</p> : null}
		</section>
	);
};

export default VendorDetailPage;
