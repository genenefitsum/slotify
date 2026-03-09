import AdditionalLinksSection from "@/components/sections/AdditionalLinksSection";
import FeaturedVendorsSection from "@/components/sections/FeaturedVendorsSection";
import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import ReadyToStartSection from "@/components/sections/ReadyToStartSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

const HomePage = () => {
	return (
		<>
			<HeroSection />
			<HowItWorksSection />
			<FeaturedVendorsSection />
			<TestimonialsSection />
			<ReadyToStartSection />
			<AdditionalLinksSection />
		</>
	);
};

export default HomePage;
