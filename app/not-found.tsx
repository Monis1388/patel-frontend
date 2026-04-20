import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[#1A1A2E] mb-4">404 - Lost in Sight</h2>
      <p className="text-gray-500 mb-8 font-bold uppercase tracking-widest text-[10px]">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="bg-[#000042] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl"
      >
        Back to Home
      </Link>
    </div>
  );
}
