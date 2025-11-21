export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white focus:bg-blue-50/30'
        }`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
    </div>
  );
}
