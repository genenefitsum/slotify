import FeaturedVendorsSection from "@/components/main/FeaturedVendorsSection";
import HeroSection from "@/components/main/HeroSection";
import HowItWorksSection from "@/components/main/HowItWorksSection";
import ReadyToStartSection from "@/components/main/ReadyToStartSection";
import TestimonialsSection from "@/components/main/TestimonialsSection";

const HomePage = () => {
	return (
		<>
			<HeroSection />
			<HowItWorksSection />
			<FeaturedVendorsSection />
			<TestimonialsSection />
			<ReadyToStartSection />
		</>
	);
};

export default HomePage;
