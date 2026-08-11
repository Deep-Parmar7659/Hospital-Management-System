export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
          <div
            className="absolute inset-0 w-12 h-12 rounded-full border-4 border-purple-500/30 border-b-purple-400 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <p className="text-cyan-400 font-medium animate-pulse">
          Loading Nexus HMS...
        </p>
      </div>
    </div>
  );
}
