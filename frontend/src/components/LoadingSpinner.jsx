const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full
          border-[#e8ecf0] border-t-[#0066cc]
          animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
