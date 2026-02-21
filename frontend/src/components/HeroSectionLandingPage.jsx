import { Link } from "react-router-dom";

const stats = [
  { label: "Patients Served", value: "50,000+" },
  { label: "Doctors", value: "200+" },
  { label: "Departments", value: "30+" },
  { label: "Years of Service", value: "25+" },
];

const HeroSectionLandingPage = () => {
  return (
    <section className="bg-gradient-to-br from-[#1a2b4a] via-[#1e3561] to-[#0d1f3c] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-700 px-3 py-1 text-xs uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Integrated Hospital Platform
            </div>

            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              MedCare <br />
              <span className="text-[#4da6ff]">Patient Care Chain</span>
            </h1>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              A unified platform for seamless patient management, staff
              coordination, and real-time monitoring across departments.
            </p>

            <Link
              to="/login"
              className="px-6 py-3 bg-[#0066cc] hover:bg-[#0055aa] text-white font-semibold text-sm rounded-sm border border-[#4da6ff]"
            >
              STAFF LOGIN →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 p-5"
              >
                <div className="text-3xl font-bold text-[#4da6ff]">
                  {s.value}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionLandingPage;