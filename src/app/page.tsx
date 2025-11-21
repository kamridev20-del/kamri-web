import BestOffers from '../components/BestOffers';
import HomeFooter from '../components/HomeFooter';
import HomeHero from '../components/HomeHero';
import ModernHeader from '../components/ModernHeader';
import ProductGrid from '../components/ProductGrid';
import TopSales from '../components/TopSales';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <ModernHeader />
      <HomeHero />
      <ProductGrid />
      <TopSales />
      <BestOffers />
      <HomeFooter />
    </div>
  );
}