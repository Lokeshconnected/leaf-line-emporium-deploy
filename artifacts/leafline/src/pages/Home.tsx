import { useLenis } from "@/hooks/useLenis";
import Hero from "@/components/Hero";
import PlantMatchmaker from "@/components/PlantMatchmaker";
import FeaturedPlants from "@/components/FeaturedPlants";
import Categories from "@/components/Categories";
import WhyUs from "@/components/WhyUs";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  useLenis();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <PlantMatchmaker />
        <FeaturedPlants />
        <Categories />
        <WhyUs />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
