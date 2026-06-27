import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store';

export default function Visualizer() {
  const { currentExp, qubitData, setQubitData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const particlesRef = useRef(Array.from({length:40},()=>({
    x: Math.random()*800, y: Math.random()*200,
    vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
    r: Math.random()*2+1, ph: Math.random()*Math.PI*2
  })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawBG = (w: number, h: number) => {
      const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.6);
      bg.addColorStop(0,'#1a0c00'); bg.addColorStop(0.4,'#0d0500'); bg.addColorStop(1,'#050200');
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = 'rgba(80,45,0,0.3)'; ctx.lineWidth = 0.4;
      for(let x=0; x<w; x+=30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for(let y=0; y<h; y+=30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    };

    const drawBloch = (cx: number, cy: number, r: number) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.strokeStyle='rgba(255,170,0,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r*0.28, 0, 0, Math.PI*2); ctx.strokeStyle='rgba(180,100,0,0.35)'; ctx.lineWidth=1; ctx.stroke();
      const ang = phaseRef.current * 0.7, vx = cx + Math.cos(ang)*r*0.85, vy = cy + Math.sin(ang*0.5)*r*0.6;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(vx,vy); ctx.strokeStyle='#ffd700'; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(vx,vy,3.5,0,Math.PI*2); ctx.fillStyle='#ffd700'; ctx.shadowColor='#ffd700'; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,170,0,0.18)'; ctx.lineWidth=0.7; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(cx, cy-r-4); ctx.lineTo(cx, cy+r+4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-r-4, cy); ctx.lineTo(cx+r+4, cy); ctx.stroke();
      ctx.setLineDash([]);
    };

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0,0,w,h);
      phaseRef.current += 0.02;
      drawBG(w,h);
      const cx = w/2, cy = h/2;

      // Rings
      [h*0.4, h*0.3, h*0.21, h*0.13, h*0.07].forEach((r,i) => {
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,${150-i*15},0,${0.15+i*0.05})`; ctx.lineWidth=i===0?1.5:1; ctx.stroke();
        for(let a=0; a<Math.PI*2; a+=Math.PI/4){
          const dx=cx+Math.cos(a+phaseRef.current*0.08*(i%2?1:-1))*r, dy=cy+Math.sin(a+phaseRef.current*0.08*(i%2?1:-1))*r;
          ctx.beginPath(); ctx.arc(dx,dy,i===0?2.5:1.5,0,Math.PI*2);
          ctx.fillStyle=i%2===0?'#ffd700':'#ff8c00';
          if(i<2){ctx.shadowColor='#ffd700'; ctx.shadowBlur=6;}
          ctx.fill(); ctx.shadowBlur=0;
        }
      });

      if(['superposition','custom','shor'].includes(currentExp)){
        drawBloch(cx,cy,Math.min(h*0.32,w*0.12));
      } else if(['entanglement','teleportation'].includes(currentExp)){
        const cx1=w*0.28, cx2=w*0.72;
        const grad=ctx.createLinearGradient(cx1,cy,cx2,cy);
        grad.addColorStop(0,'rgba(255,215,0,0.5)'); grad.addColorStop(0.5,'rgba(255,140,0,0.7)'); grad.addColorStop(1,'rgba(255,215,0,0.5)');
        ctx.beginPath(); ctx.moveTo(cx1,cy); ctx.lineTo(cx2,cy); ctx.strokeStyle=grad; ctx.lineWidth=2; ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
        drawBloch(cx1,cy,Math.min(h*0.28,w*0.09)); drawBloch(cx2,cy,Math.min(h*0.28,w*0.09));
      }

      // Particles
      particlesRef.current.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.ph+=0.04;
        if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,200,80,${0.12+Math.sin(p.ph)*0.08})`; ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [currentExp]);

  // Qubit updates
  useEffect(() => {
    const int = setInterval(() => {
      setQubitData(qubitData.map(q => ({
         ...q,
         state: Math.random() > 0.75 ? q.state : q.state, // simplifed random updates
         ent: Math.random() > 0.88 ? !q.ent : q.ent
      })));
    }, 2800);
    return () => clearInterval(int);
  }, [qubitData, setQubitData]);

  return (
    <div className="visualizer">
      <div className="vis-label">CRYOGENIC QUANTUM STATE VISUALIZER · {currentExp.toUpperCase()}</div>
      <div className="vis-temp">T = 15 mK · COHERENCE ACTIVE</div>
      <canvas id="qCanvas" ref={canvasRef}></canvas>
      <div className="qubit-row">
        {qubitData.map(q => (
          <div key={q.id} className={`qubit-chip ${q.ent ? 'ent' : ''} ${q.active ? 'active' : ''}`}>
            {q.id}:{q.state}
          </div>
        ))}
      </div>
    </div>
  );
}
