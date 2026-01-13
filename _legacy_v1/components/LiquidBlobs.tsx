import React from 'react';

const LiquidBlobs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top Left Blob */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
      
      {/* Top Right Blob */}
      <div className="absolute top-0 -right-4 w-96 h-96 bg-sky-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      {/* Bottom Center Blob */}
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      {/* Large Central Soft Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/0 rounded-full shadow-[0_0_200px_rgba(56,189,248,0.05)]"></div>
    </div>
  );
};

export default LiquidBlobs;