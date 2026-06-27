import Navbar from "@/components/landing/Navbar";
import GetQuote from "@/components/landing/GetQuote";
import Footer from "@/components/landing/Footer";

export default function GetQuotePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-vp-ink text-white">
      <div className="noise-layer" />

      <Navbar />

      <div className="pt-20 md:pt-24">
        <GetQuote />
      </div>

      <Footer />
    </main>
  );
}
