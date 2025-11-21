export default function Card({ children, className = '', title, ...props }) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
