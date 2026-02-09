export function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Noise Texture */}
      <div className="absolute inset-0 noise-overlay" />
      
      {/* Cosmic Gradient */}
      <div className="absolute inset-0 bg-cosmic-gradient opacity-90" />
      
      {/* Blue Glow - Top Right */}
      <div 
        className="absolute top-[20%] right-[10%] w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: 'hsl(var(--kasona-blue) / 0.05)' }}
      />
      
      {/* Orange Glow - Bottom Left */}
      <div 
        className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: 'hsl(var(--primary) / 0.05)' }}
      />
    </div>
  );
}
