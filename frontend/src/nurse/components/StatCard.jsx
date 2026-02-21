const StatCard = ({ icon, label, value, gradient, iconBg }) => (
  <div
    className="relative overflow-hidden rounded-lg p-5 text-white shadow-md
      hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    style={{ background: gradient }}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs font-semibold uppercase tracking-wider mt-0.5 opacity-90">
          {label}
        </div>
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
    </div>
    {/* Decorative circle */}
    <div
      className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10"
      style={{ background: "white" }}
    />
  </div>
);

export default StatCard;
