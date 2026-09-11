import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Eye, FileText, RotateCw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LoopGraphicProps {
  isRelocked?: boolean;
  onToggleStatus?: () => void;
}

export const LoopGraphic: React.FC<LoopGraphicProps> = ({
  isRelocked = true,
  onToggleStatus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [speedMode, setSpeedMode] = useState<number>(1); // 1 = 1x, 2 = 2x, 3 = 3x, -1 = reverse
  const [pokes, setPokes] = useState(0);
  const [showPdfBadge, setShowPdfBadge] = useState(true);

  // Keep animated state in a ref so the 60fps render loop reads the latest values without re-mounting
  const stateRef = useRef({
    rotation: 0,
    speedMode: 1,
    isHovered: false,
    pokes: 0,
    pokeWobble: 0,
  });

  useEffect(() => {
    stateRef.current.speedMode = speedMode;
    stateRef.current.isHovered = isHovered;
    stateRef.current.pokes = pokes;
  }, [speedMode, isHovered, pokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const st = stateRef.current;
      const hoverMult = st.isHovered ? 1.5 : 1.0;
      const spinSpeed = st.speedMode * hoverMult * 1.2; // Radians per sec
      st.rotation += spinSpeed * dt;

      if (st.pokeWobble > 0) {
        st.pokeWobble = Math.max(0, st.pokeWobble - dt * 2.8);
      }

      // Handle retina / high-DPI
      const dpr = window.devicePixelRatio || 1;
      const w = 340;
      const h = 340;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Geometry for the pure loop circle (centered, no lines touching any square)
      const cx = 170;
      const cy = 170;
      const rOuter = 142;
      const rInner = 68;
      const turns = 3.6; // Concentric spiral coils winding inward around the center PDF
      const totalAngle = turns * Math.PI * 2;

      // Infinite inward rotation phase:
      const rawPhi = st.rotation % (Math.PI * 2);
      const phi = rawPhi < 0 ? rawPhi + Math.PI * 2 : rawPhi;

      // Detect theme ink color or fallback to dark charcoal/slate ink
      let inkColor = '#242738';
      let notchColor = '#4C516D';
      try {
        const computed = getComputedStyle(canvas);
        const cssInk = computed.getPropertyValue('--ink').trim();
        if (cssInk) {
          inkColor = cssInk;
          notchColor = computed.getPropertyValue('--ink-soft').trim() || cssInk;
        }
      } catch {
        // use fallback
      }

      ctx.save();
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Outer circular ring: A complete, smooth circular boundary loop (no tails or lines touching any border)
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.stroke();

      // 2. The spiral coils winding smoothly and continuously inward
      ctx.beginPath();
      const spiralSteps = 260;
      let lastPoint = { x: cx, y: cy };
      for (let i = 0; i <= spiralSteps; i++) {
        const t = i / spiralSteps; // 0 (outer) to 1 (inner)
        const gamma = t * totalAngle;
        const a = (Math.PI / 2 - phi) - gamma;
        const r = rOuter - t * (rOuter - rInner);

        // Organic pen jitter & ripple wave on poke
        const wob = Math.sin(t * 18 + time * 0.003) * (0.35 + st.pokeWobble * 1.8);
        const curR = r + wob;
        const x = cx + curR * Math.cos(a);
        const y = cy + curR * Math.sin(a);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        lastPoint = { x, y };
      }
      ctx.stroke();

      // 3. Small center hook & tip dot terminating neatly around the center
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 3.4, 0, Math.PI * 2);
      ctx.fill();

      // 4. Subtle rope/pen texture notches along the circular coils for tactile movement
      const notchCount = 16;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = notchColor;
      for (let n = 1; n <= notchCount; n++) {
        const t = ((n / notchCount) + (time * 0.0004 * st.speedMode)) % 1;
        const gamma = t * totalAngle;
        const a = (Math.PI / 2 - phi) - gamma;
        const r = rOuter - t * (rOuter - rInner);
        if (r > rInner + 8 && r < rOuter - 6) {
          const nx = cx + r * Math.cos(a);
          const ny = cy + r * Math.sin(a);
          const dx = -Math.sin(a) * 3;
          const dy = Math.cos(a) * 3;
          ctx.beginPath();
          ctx.moveTo(nx - dx, ny - dy);
          ctx.lineTo(nx + dx, ny + dy);
          ctx.stroke();
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePoke = () => {
    sounds.playClick();
    setPokes((p) => p + 1);
    stateRef.current.pokeWobble = 1.2;
  };

  const handleCycleSpeed = () => {
    sounds.playClick();
    setSpeedMode((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      if (prev === 3) return -1;
      return 1;
    });
  };

  return (
    <div className="flex flex-col items-center select-none my-2">
      {/* 
        Pure Loop Circle:
        - Self-contained circular spiral loop without any line touching a square
        - No square wrapper or border around the loop
        - Direct transparent rendering on checked graph paper
        - Centered PDF Document Graphic
      */}
      <div className="relative w-[340px] h-[340px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onClick={handlePoke}
          className="w-[340px] h-[340px] absolute inset-0 cursor-pointer"
          title="Click anywhere on the loop circle to ripple it!"
        />

        {/* Center PDF Document Graphic (Turned into an authentic, sleek PDF document) */}
        {showPdfBadge && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handlePoke}
            style={{
              transform: `rotate(${Math.sin(stateRef.current.rotation * 0.7) * 2.5}deg) scale(${isHovered ? 1.06 : 1})`,
            }}
            className="relative z-10 w-24 h-32 bg-[#FAF8F5] border-2 border-[var(--border-ink)] shadow-[3px_3px_0px_var(--shadow-ink)] rounded-md p-2 flex flex-col justify-between cursor-pointer transition-all duration-200 group"
            title="Click to interact with your PDF!"
          >
            {/* Authentic Folded Dog-Ear Top-Right Corner */}
            <div className="absolute top-0 right-0 w-5 h-5 bg-[var(--paper)] border-b-2 border-l-2 border-[var(--border-ink)] shadow-[-1px_1px_0px_rgba(0,0,0,0.12)]" />

            {/* Top Header: Crimson PDF Badge & Extension */}
            <div className="flex items-center justify-between pr-4">
              <div className="bg-[#E11D48] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider flex items-center gap-1">
                <FileText className="w-2.5 h-2.5 text-white" />
                <span>PDF</span>
              </div>
              <span className="text-[8px] font-mono text-[var(--ink-soft)] font-medium">.pdf</span>
            </div>

            {/* Center: Real Document Content Simulation (mimicking PDF text paragraphs) */}
            <div className="my-auto space-y-1.5 px-0.5 w-full">
              <div className="h-1.5 bg-[#E11D48]/25 rounded w-4/5" />
              <div className="h-1 bg-[var(--border-ink)]/25 rounded w-full" />
              <div className="h-1 bg-[var(--border-ink)]/25 rounded w-5/6" />
              <div className="h-1 bg-[var(--border-ink)]/20 rounded w-3/4" />

              {/* Status Stamp inside document */}
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus?.();
                  }}
                  className={`inline-flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded border shadow-sm transition-colors cursor-pointer ${
                    isRelocked
                      ? 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
                  }`}
                  title="Click to toggle lock status"
                >
                  {isRelocked ? (
                    <Lock className="w-2.5 h-2.5 text-rose-600" />
                  ) : (
                    <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                  )}
                  <span className="font-bold">{isRelocked ? 'RELOCKED' : 'UNLOCKED'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer: Document Info & Poke Tracker */}
            <div className="pt-1 border-t border-[var(--paper-line)] flex items-center justify-between text-[7.5px] font-mono text-[var(--ink-soft)]">
              <span className="truncate max-w-[55px]">doc_file</span>
              <span className="text-[var(--red)] font-semibold">
                {pokes > 0 ? `poke x${pokes}` : '1 / 1'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Discreet Control Bar Placed Below The Graphic (Loop remains completely unboxed and square-free) */}
      <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-xs font-mono">
        <button
          onClick={handleCycleSpeed}
          className="bg-[var(--card-bg)] hover:bg-[var(--card-alt)] text-[11px] font-mono px-2.5 py-1 border border-[var(--border-ink)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)] rounded text-[var(--ink)] cursor-pointer flex items-center gap-1.5 transition-colors"
          title="Change loop speed"
        >
          <RotateCw className="w-3 h-3 text-[var(--red)]" />
          <span>
            {speedMode === 1 && 'Inward Speed: 1x'}
            {speedMode === 2 && 'Inward Speed: 2x'}
            {speedMode === 3 && 'Inward Speed: 3x'}
            {speedMode === -1 && 'Direction: Reverse'}
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setShowPdfBadge((prev) => !prev);
          }}
          className="bg-[var(--card-bg)] hover:bg-[var(--card-alt)] text-[11px] font-mono px-2.5 py-1 border border-[var(--border-ink)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)] rounded text-[var(--ink)] cursor-pointer flex items-center gap-1.5 transition-colors"
          title="Toggle PDF document in loop center"
        >
          {showPdfBadge ? (
            <>
              <Eye className="w-3 h-3 text-[var(--ink-soft)]" />
              <span>Show Pure Loop</span>
            </>
          ) : (
            <>
              <FileText className="w-3 h-3 text-[var(--red)]" />
              <span>Show PDF in Loop</span>
            </>
          )}
        </button>

        {onToggleStatus && (
          <button
            onClick={onToggleStatus}
            className="bg-[var(--card-bg)] hover:bg-[var(--card-alt)] text-[11px] font-mono px-2.5 py-1 border border-[var(--border-ink)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)] rounded text-[var(--ink)] cursor-pointer flex items-center gap-1.5 transition-colors"
            title="Toggle relocked / unlocked state"
          >
            {isRelocked ? (
              <>
                <Lock className="w-3 h-3 text-[var(--red)]" />
                <span className="font-bold text-[var(--ink)]">Relocked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-emerald-500" />
                <span className="font-bold text-[var(--ink)]">Unlocked</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
