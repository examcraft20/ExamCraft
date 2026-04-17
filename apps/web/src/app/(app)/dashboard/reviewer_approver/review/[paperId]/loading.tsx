import { Spinner } from "@examcraft/ui";

export default function ReviewLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-24 h-24 rounded-[2.5rem] border border-indigo-500/20 bg-indigo-500/5 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="lg" className="text-indigo-500" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] italic">
          Decrypting Content
        </h2>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-shimmer">
          Synchronizing institutional item bank...
        </p>
      </div>

      <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-indigo-500 w-1/3 animate-loading-bar" />
      </div>
    </div>
  );
}
