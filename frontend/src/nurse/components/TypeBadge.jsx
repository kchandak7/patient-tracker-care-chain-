const colors = {
  MEDICATION: "bg-purple-100 text-purple-700 border-purple-200",
  TEST: "bg-cyan-100 text-cyan-700 border-cyan-200",
  VITALS: "bg-orange-100 text-orange-700 border-orange-200",
};

const TypeBadge = ({ type }) => (
  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors[type] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    {type}
  </span>
);

export default TypeBadge;
