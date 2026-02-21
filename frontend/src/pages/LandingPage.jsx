import NavbarLandingPage from "../components/NavbarLandingPage.jsx";
import HeroSectionLandingPage from "../components/HeroSectionLandingPage.jsx";
import CardsLandingPage from "../components/CardsLandingPage.jsx";
import FooterLandingPage from "../components/FooterLandingPage.jsx";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">
      <NavbarLandingPage />

      <div className="h-4 bg-[#f0f4f8]" />

      <HeroSectionLandingPage />
      <CardsLandingPage />
      <FooterLandingPage />
    </div>
  );
};

export default LandingPage;