import React, { useEffect, useRef } from 'react';
import { createRetroPixelField } from '../shaders/animated-top-dock/retroPixelField';

interface FiringPixelMatrixBackgroundProps {
  pixelSize?: number;
  levels?: number;
  noise?: number;
  scanlines?: number;
  speed?: number;
}

export const FiringPixelMatrixBackground: React.FC<FiringPixelMatrixBackgroundProps> = ({
  pixelSize = 4,
  levels = 7,
  noise = 1.0,
  scanlines = 0.32,
  speed = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const field = createRetroPixelField(canvas, () => ({
      pixelSize,
      levels,
      noise,
      speed,
    }));

    let animationFrameId = 0;
    let isVisible = true;

    const handleResize = () => {
      if (!container || !field) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      field.resize(width, height);
    };

    const handleVisibility = ([entry]: IntersectionObserverEntry[]) => {
      isVisible = entry ? entry.isIntersecting : true;
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    const intersection = new IntersectionObserver(handleVisibility);
    intersection.observe(container);

    window.addEventListener('resize', handleResize);
    handleResize();

    const loop = (now: number) => {
      if (isVisible) {
        field.render(now);
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener('resize', handleResize);
      field.dispose();
    };
  }, [pixelSize, levels, noise, speed]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0b0819]"
      aria-hidden="true"
      style={
        {
          '--atd-retro-scan': scanlines,
        } as React.CSSProperties
      }
    >
      {/* Raw WebGL 8-Stop Dusk Firing Pixel Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* Retro Vignette Gradient Overlay (Lighter so firing pixels glow visibly through all translucent glass cards) */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          background:
            'radial-gradient(124% 90% at 50% 34%, transparent 35%, rgba(6, 4, 16, 0.4) 100%), linear-gradient(180deg, rgba(6, 4, 16, 0.35) 0%, transparent 18%, transparent 68%, rgba(6, 4, 16, 0.5) 100%)',
        }}
      />

      {/* Screen-Resolution CRT Scanline Raster Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-2"
        style={{
          opacity: scanlines * 1.5,
          background:
            'repeating-linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0 1px, transparent 1px 3px)',
        }}
      />
    </div>
  );
};
