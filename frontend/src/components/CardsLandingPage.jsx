import { Link } from "react-router-dom";

const portals = [
  {
    role: "Admin",
    color: "bg-[#1a2b4a]",
    icon: "🛡️",
    desc: "System administration & user management",
  },
  {
    role: "Doctor",
    color: "bg-[#0b4f8a]",
    icon: "👨‍⚕️",
    desc: "Patient records & medical history",
  },
  {
    role: "Nurse",
    color: "bg-[#0d6b6b]",
    icon: "🩺",
    desc: "Patient care & daily monitoring",
  },
];

const services = [
  {
    title: "Patient Management",
    desc: "Streamlined tracking of patient records, history, and care plans.",
  },
  {
    title: "Role-Based Access",
    desc: "Secure portals for Doctors and Nurses with custom dashboards.",
  },
  {
    title: "Analytics & Reports",
    desc: "Real-time insights on patient flow and staff performance.",
  },
  {
    title: "Secure & Compliant",
    desc: "HIPAA-compliant data handling with audit trails.",
  },
];

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Oncology",
  "Pediatrics",
  "Radiology",
  "General Surgery",
];

const CardsLandingPage = () => {
  return (
    <>
      {/* Quick Access */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-lg font-bold text-[#1a2b4a] mb-6 uppercase">
          Quick Access
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portals.map((p) => (
            <Link
              to="/login"
              key={p.role}
              className={`${p.color} text-white p-5 rounded-sm hover:opacity-90`}
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <div className="font-bold text-sm mb-1">{p.role} Portal</div>
              <div className="text-xs opacity-70">{p.desc}</div>
              <div className="mt-3 text-xs opacity-60">LOGIN →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="bg-white border-t border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="border border-gray-200 p-5 hover:border-[#0066cc] hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-sm text-[#1a2b4a] mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-lg font-bold text-[#1a2b4a] mb-6 uppercase">
          Departments
        </h2>

        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <span
              key={d}
              className="px-4 py-2 bg-white border border-gray-300 text-sm text-gray-700 hover:border-[#0066cc] hover:text-[#0066cc]"
            >
              {d}
            </span>
          ))}
        </div>
      </section>
    </>
  );
};

export default CardsLandingPage;