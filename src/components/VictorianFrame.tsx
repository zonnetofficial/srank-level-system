import React from 'react';

interface VictorianFrameProps {
  children: React.ReactNode;
  className?: string;
}

const VictorianFrame: React.FC<VictorianFrameProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen px-5 pt-8 pb-8 max-w-lg mx-auto hud-scanlines hud-glitch hud-grid-bg ${className}`}>
      {/* HUD border frame */}
      <div className="hud-frame" aria-hidden="true">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
        <div className="hud-border-line hud-border-top" />
        <div className="hud-border-line hud-border-bottom" />
        <div className="hud-border-left" />
        <div className="hud-border-right" />
      </div>

      <div className="relative z-[2]">
        {children}
      </div>
    </div>
  );
};

export default VictorianFrame;
