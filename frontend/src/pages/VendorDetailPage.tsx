import { useParams } from "react-router-dom";

const VendorDetailPage = () => {
	const { id } = useParams();

	return (
		<section className="container mx-auto px-4 py-14">
			<h1 className="text-3xl">Vendor Profile</h1>
			<p className="mt-3 text-muted-foreground">
				Detail page for vendor <span className="font-semibold">{id}</span> will be
				implemented in the next phase.
			</p>
		</section>
	);
};

export default VendorDetailPage;
