import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ValuePlusAcademy from "@/components/landing/ValuePlusAcademy";
import Portfolio from "@/components/landing/Portfolio";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-vp-ink text-white">
      <div className="noise-layer" />

      <Navbar />
      <Hero />
      <ValuePlusAcademy />
      <Portfolio />
      <Footer />
    </main>
  );
}
