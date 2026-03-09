export default function Button({ children, variant = "solid" }) {
  if (variant === "outline") {
    return (
      <button className="border border-[#d4a23f] text-[#d4a23f] px-8 py-3 uppercase tracking-widest hover:bg-[#d4a23f] hover:text-black transition">
        {children}
      </button>
    );
  }

  return (
    <button className="bg-[#d4a23f] text-black px-8 py-3 uppercase tracking-widest hover:opacity-90 transition">
      {children}
    </button>
  );
}
