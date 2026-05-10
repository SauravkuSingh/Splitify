const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-orange-50/30 flex items-center justify-center backdrop-blur-sm">
      <div className="text-center bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-orange-100/50 animate-in zoom-in duration-500">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse"></div>
        </div>
        <p className="text-foreground font-bold tracking-tight">{message}</p>
        <div className="flex gap-1 justify-center mt-3">
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;