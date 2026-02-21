const FooterLandingPage = () => {
  return (
    <footer className="bg-[#1a2b4a] text-gray-400 py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between text-xs">
        <span>© {new Date().getFullYear()} MedCare Hospital Management System</span>        <span>Patient Care Chain | Group Project | v2.4.1</span>
      </div>
    </footer>
  );
};

export default FooterLandingPage;