export default function Toast({ show, message }) {
  if (!show) return null;

  return (
    <div className="
      fixed top-24 right-10 z-[999]
      bg-[#111827] border border-[#d4a441]
      text-white px-6 py-4 rounded-xl
      shadow-[0_0_30px_rgba(212,164,65,0.35)]
      animate-fadeIn
    ">
      <div className="flex items-center gap-3">
        <span className="text-[#d4a441] text-lg">✓</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
