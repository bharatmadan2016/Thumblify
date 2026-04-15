import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import TestimonialSection from "../sections/TestimonialSection";
import PricingSection from "../sections/PricingSection";
import ContactSection from "../sections/ContactSection";
import CTASection from "../sections/CTASection";
import ReviewSection from "../components/ReviewSection";

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <TestimonialSection />
            <ReviewSection />
            <PricingSection />
            <ContactSection />
            <CTASection />
        </>
    );
}