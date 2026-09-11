import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { PdfFileItem } from '../types';
import { sounds } from '../utils/audio';
import { downloadClearedPdf } from '../utils/generatePdf';

interface PullHardGameProps {
  activePdf?: PdfFileItem;
  onBackToHome?: () => void;
}

export const PullHardGame: React.FC<PullHardGameProps> = ({
  activePdf,
  onBackToHome,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pullCount, setPullCount] = useState<number>(0);
  const [progressWidth, setProgressWidth] = useState<string>('0%');
  const [statusText, setStatusText] = useState<string>('Grab the rope.');
  const [isPullDisabled, setIsPullDisabled] = useState<boolean>(false);
  const [isOverlayShow, setIsOverlayShow] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  // Mutable animation state references to match original vanilla JS loop exactly
  const stateRef = useRef({
    pullCount: 0,
    progress: 0,
    displayProgress: 0,
    spinSpeed: 0.008,
    rotation: 0,
    loopKick: 0,
    phase: 'idle' as 'idle' | 'pulling' | 'slack' | 'yank' | 'end',
    phaseStart: 0,
    finaleData: null as { startX: number; startY: number; dur: number } | null,
  });

  const lines = [
    "Grab the rope.",
    "There. Progress.",
    "Getting closer.",
    "Almost.",
    "Nearly there.",
    "Wait—",
    "It's not slowing down, right?",
    "One more should do it.",
    "It's spinning faster.",
    "Just one more pull.",
    "The rope goes slack."
  ];

  const updateHudState = useCallback((count: number, prog: number) => {
    setPullCount(Math.min(count, 10));
    setProgressWidth((Math.min(prog, 1) * 100).toFixed(1) + '%');
    setStatusText(lines[Math.min(count, lines.length - 1)]);
  }, []);

  const doPull = useCallback(() => {
    const st = stateRef.current;
    if (st.phase !== 'idle' && st.phase !== 'pulling') return;
    if (st.pullCount >= 10) return;

    st.pullCount++;
    sounds.playPull(st.pullCount);

    // diminishing returns: shrinking gain, base decays each pull
    const gain = 0.15 * Math.pow(0.80, st.pullCount - 1);
    st.progress = Math.min(st.progress + gain, 0.9);
    st.spinSpeed = 0.008 + st.pullCount * 0.011;
    st.loopKick = 16;
    st.phase = 'pulling';

    updateHudState(st.pullCount, st.progress);

    if (st.pullCount >= 10) {
      setIsPullDisabled(true);
      setTimeout(() => {
        st.phase = 'slack';
        st.phaseStart = performance.now();
        sounds.playSnap();

        setTimeout(() => {
          st.phase = 'yank';
          st.phaseStart = performance.now();
          sounds.playLaunch();

          const W = canvasRef.current ? canvasRef.current.width : 840;
          const startX = 100;
          const loopBaseX = W - 150;
          const currentPersonX = startX + st.displayProgress * (loopBaseX - startX - 150);
          st.finaleData = { startX: currentPersonX, startY: 250, dur: 0 };
        }, 420);
      }, 250);
    }
  }, [updateHudState]);

  const handleDownloadCleared = useCallback(() => {
    sounds.playSuccess();
    const pdfFilename = activePdf?.name || "cleared_document.pdf";
    downloadClearedPdf(pdfFilename, activePdf?.name);
    setDownloaded(true);
  }, [activePdf]);

  const reset = useCallback(() => {
    sounds.playClick();
    const st = stateRef.current;
    st.pullCount = 0;
    st.progress = 0;
    st.displayProgress = 0;
    st.spinSpeed = 0.008;
    st.rotation = 0;
    st.loopKick = 0;
    st.phase = 'idle';
    st.finaleData = null;

    setIsPullDisabled(false);
    setIsOverlayShow(false);
    setDownloaded(false);
    updateHudState(0, 0);
  }, [updateHudState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const W = canvas.width, H = canvas.height;
    const startX = 100, groundY = 250;
    const loopBaseX = W - 150, loopBaseY = 150;

    const personX = (p: number) => startX + p * (loopBaseX - startX - 150);

    const jitter = (time: number, seed: number, amp: number) => {
      return Math.sin(time * 0.0026 + seed) * amp + Math.sin(time * 0.0061 + seed * 1.7) * amp * 0.4;
    };

    const getInk = () => {
      return getComputedStyle(canvas).getPropertyValue('--ink').trim() || '#4C4F69';
    };

    // Draws the rope and the loop seamlessly as ONE continuous unbroken rope
    const drawConnectedRopeAndLoop = (
      handX: number,
      handY: number,
      loopX: number,
      loopY: number,
      loopR: number,
      sag: number,
      time: number,
      swirl: number,
      hasRope: boolean
    ) => {
      const ink = getInk();
      const thetaOuter = Math.PI * 0.52; // Enters bottom of the loop (~93.6 deg)
      const outerX = loopX + Math.cos(thetaOuter) * loopR;
      const outerY = loopY + Math.sin(thetaOuter) * (loopR * 0.92);

      ctx.save();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (!hasRope) {
        // When rope is released/swallowed, draw just the resting vortex loop
        ctx.beginPath();
        const turns = 3.2, steps = 140;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const a = thetaOuter - t * turns * Math.PI * 2 - swirl;
          const r = loopR * (1 - t * 0.88);
          const wob = jitter(time, i * 0.35, 1.1) * (1 - t * 0.4);
          const sx = loopX + Math.cos(a) * r + wob;
          const sy = loopY + Math.sin(a) * (r * 0.92) + wob * 0.7;
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.beginPath();
      const dx = outerX - handX;
      const dy = outerY - handY;

      if (dx > 20) {
        // Start from person's hands
        ctx.moveTo(handX, handY);

        const cp1Dist = Math.min(dx * 0.38, 140);
        const cp1x = handX + cp1Dist;
        const cp1y = handY + dy * 0.22 + sag + jitter(time, 3.2, 1.2);

        // Arrive tangent to the bottom arc of the loop moving right/upward
        const tx = Math.sin(thetaOuter); // ~ +0.99
        const ty = -Math.cos(thetaOuter) * 0.92; // ~ +0.06
        const cp2Dist = Math.min(dx * 0.32, 110);
        const cp2x = outerX - tx * cp2Dist;
        const cp2y = outerY - ty * cp2Dist + sag * 0.3 + jitter(time, 4.3, 0.9);

        // Smooth bezier curve for the rope body
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, outerX, outerY);
      } else {
        ctx.moveTo(outerX, outerY);
      }

      // Seamlessly continue into the spiral loop as the very same rope (no pen lift)
      const turns = 3.2, steps = 140;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        // Outer rope connection (t=0) is permanently locked to outerX, outerY,
        // while inner coils swirl dynamically with tension/speed
        const spinFactor = Math.pow(t, 1.4);
        const a = thetaOuter - t * turns * Math.PI * 2 - swirl * spinFactor;
        const r = loopR * (1 - t * 0.88);
        const wob = jitter(time, i * 0.35, 1.1) * (1 - t * 0.4);
        const sx = loopX + Math.cos(a) * r + wob;
        const sy = loopY + Math.sin(a) * (r * 0.92) + wob * 0.7;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Hand-drawn center core dot for the vortex
      const lastAngle = thetaOuter - turns * Math.PI * 2 - swirl;
      const coreR = loopR * 0.12;
      const coreX = loopX + Math.cos(lastAngle) * coreR;
      const coreY = loopY + Math.sin(lastAngle) * (coreR * 0.92);
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.arc(coreX, coreY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawCoil = (x: number, y: number, r: number, rot: number) => {
      const ink = getInk();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const turns = 1.8, steps = 40;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * turns * Math.PI * 2;
        const rr = (i / steps) * r;
        const x2 = Math.cos(a) * rr, y2 = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawPerson = (x: number, y: number, alpha: number, scale: number, rot: number, time: number) => {
      const ink = getInk();
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 2;

      const bob = (stateRef.current.phase === 'idle' || stateRef.current.phase === 'pulling')
        ? Math.sin(time * 0.0022) * 2
        : 0;

      // head
      ctx.beginPath();
      ctx.arc(0, -44 + bob, 13, 0, Math.PI * 2);
      ctx.stroke();

      // eyes
      ctx.beginPath();
      ctx.arc(-4, -46 + bob, 1.4, 0, Math.PI * 2);
      ctx.arc(3, -46 + bob, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // body
      ctx.beginPath();
      ctx.moveTo(0, -31 + bob);
      ctx.lineTo(-2, 4 + bob);
      ctx.stroke();

      // legs (dangling, slight sway)
      const sway = Math.sin(time * 0.0018) * 4;
      ctx.beginPath();
      ctx.moveTo(-2, 4 + bob);
      ctx.lineTo(-14 + sway, 26 + bob);
      ctx.lineTo(-10 + sway, 40 + bob);
      ctx.moveTo(-2, 4 + bob);
      ctx.lineTo(8 - sway, 24 + bob);
      ctx.lineTo(4 - sway, 40 + bob);
      ctx.stroke();

      // arm to rope (reaches forward/right)
      ctx.beginPath();
      ctx.moveTo(-1, -22 + bob);
      ctx.lineTo(30, -14 + bob);
      ctx.stroke();

      ctx.restore();
    };

    const loopPos = () => {
      const st = stateRef.current;
      const reel = Math.min(st.pullCount, 10) * 5.4;
      const kickNow = st.loopKick;
      return { x: loopBaseX + reel + kickNow, y: loopBaseY };
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, W, H);
      const st = stateRef.current;

      // ease loopKick back to 0
      st.loopKick += (0 - st.loopKick) * 0.12;
      // ease displayProgress toward progress
      st.displayProgress += (st.progress - st.displayProgress) * 0.14;

      const lp = loopPos();
      const loopR = 62;
      st.rotation += st.spinSpeed;

      let px = personX(st.displayProgress);
      let py = groundY;
      let alpha = 1, scale = 1, rot = 0;
      let sag = jitter(time, 1, 1.5);

      if (st.phase === 'slack') {
        const el = time - st.phaseStart;
        const k = Math.min(el / 380, 1);
        sag = 6 + k * 46;
      } else if (st.phase === 'yank' || st.phase === 'end') {
        const el = st.phase === 'end' ? (st.finaleData ? st.finaleData.dur : 1100) : (time - st.phaseStart);
        const k = Math.min(el / 1100, 1);
        const ease = 1 - Math.pow(1 - k, 3);
        if (st.finaleData) {
          px = st.finaleData.startX + (lp.x - st.finaleData.startX) * ease;
          py = st.finaleData.startY + (lp.y - st.finaleData.startY) * ease;
        }
        scale = 1 - ease * 0.94;
        rot = ease * Math.PI * 6;
        alpha = 1 - ease * 0.98;
        sag = -30 * ease;

        if (st.phase === 'yank' && k >= 1) {
          st.phase = 'end';
          if (st.finaleData) st.finaleData.dur = 1100;
          setIsOverlayShow(true);
        }
      }

      // hand point
      const handX = px + 30;
      const handY = py - 14 + Math.sin(time * 0.0022) * 2;

      const hasRope = st.phase !== 'end';

      // Draw the rope and loop as ONE continuous, connected rope
      drawConnectedRopeAndLoop(
        handX,
        handY,
        lp.x,
        lp.y,
        loopR,
        sag,
        time,
        st.rotation,
        hasRope
      );

      if (hasRope && st.phase !== 'yank') {
        drawCoil(handX - 6, handY + 2, 10, time * 0.01 * (1 + st.pullCount * 0.18));
      }

      // person
      drawPerson(px, py, alpha, scale, rot, time);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {onBackToHome && (
        <div className="w-full max-w-[740px] px-4 pt-3 flex justify-start">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 font-mono text-xs text-[#5C6370] hover:text-[#181A22] border-b border-dashed border-[#5C6370] hover:border-[#181A22] transition-colors pb-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E03626]" />
            <span>back to loopdfy home</span>
          </button>
        </div>
      )}

      {/* The exact sheet layout and structure from user file */}
      <div className="sheet">
        <header>
          <h1>the pull</h1>
          <div className="sub">ten pulls. one loop. it does not get easier.</div>
        </header>

        <div className="stage">
          <canvas id="c" ref={canvasRef} width={840} height={360} />
          <div className={`overlay ${isOverlayShow ? 'show' : ''}`} id="overlay">
            <div className="panel">
              <h2>You pulled hard.<br />The loop pulled harder.</h2>
              <div className="dl">
                <div className="row1">
                  <span>acceptance.pdf</span>
                  <span>0%</span>
                </div>
                <div className="bar">
                  <span></span>
                </div>
                <div className="row2">
                  <span>downloading&hellip;</span>
                  <span>time remaining: forever</span>
                </div>
              </div>

              <div>
                <button
                  className={`dl-cleared ${downloaded ? 'success' : ''}`}
                  id="downloadClearedBtn"
                  onClick={handleDownloadCleared}
                  title="Download the cleared PDF"
                >
                  {downloaded ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{downloaded ? 'downloaded cleared pdf!' : 'download cleared pdf'}</span>
                </button>
              </div>

              <div>
                <button className="again" id="again" onClick={reset}>
                  pull again
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hud">
          <div className="count">
            pull <b id="pullNum">{pullCount}</b> / 10
          </div>
          <div className="meter" style={{ flex: 1, margin: '0 14px' }}>
            <i id="meterFill" style={{ width: progressWidth }}></i>
          </div>
        </div>
        <div className="status" id="status">
          {statusText}
        </div>

        <div className="controls">
          {!isPullDisabled && pullCount < 10 && (
            <button
              className="pull"
              id="pullBtn"
              onClick={doPull}
            >
              Pull hard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
