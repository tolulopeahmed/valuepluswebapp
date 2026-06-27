import Navbar from "@/components/landing/Navbar";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function PricingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-vp-ink text-white">
      <div className="noise-layer" />

      <Navbar />

      <div className="pt-20 md:pt-24">
        <Pricing />
      </div>

      <Footer />
    </main>
  );
}
