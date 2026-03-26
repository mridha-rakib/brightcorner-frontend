import { Features } from "@/components/landing/features";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { Picture } from "@/components/landing/picture";
import { Manifesto } from "@/components/landing/manifesto";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="container mx-auto">
                <Hero />
                <Picture />
                <Features />
                <Manifesto />
                <TrustedBy />
                <CTASection />
            </main>
            <Footer />
        </div>
    )
}
