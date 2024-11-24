import Globe from "@/components/ui/globe";
import Review from "@/components/review";
 
export default function GlobeDemo() {
  return (
    <div className="px-4">
      <div className="relative flex size-full items-center justify-center overflow-hidden px-40 pb-40 pt-16 md:pb-60">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Globally
      </span>
      <Globe className="top-28" />
      <div className="pointer-events-none absolute inset-0 h-full" />
    </div>
    <div className="lg:px-28">
            <Review/>
    </div>
    </div>
  );
}
