import { Link } from "react-router-dom";

const NavbarLandingPage = () => {
  return (
    <header className="bg-[#1a2b4a]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="text-white font-bold text-lg tracking-wide">
          MEDCARE
        </div>

        <Link
          to="/login"
          className="px-4 py-2 bg-[#0066cc] hover:bg-[#0055aa] text-white text-sm font-semibold rounded-sm transition-colors"
        >
          LOGIN
        </Link>
      </div>
    </header>
  );
};

export default NavbarLandingPage;