(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  // utilities
  const rand = (a,b)=> a + Math.random()*(b-a);
  const easeOutBack = t => {
    const c1 = 1.70158; const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t-1,3) + c1 * Math.pow(t-1,2);
  };

  class Flower {
    constructor(x,y,scale,phase){
      this.x = x; this.y = y; this.scale = scale || 1; this.phase = phase || Math.random()*Math.PI*2;
      this.petalCount = Math.floor(rand(6,10));
      this.petalLen = rand(18,36);
      this.petalWid = rand(10,20);
      this.color = '#ffd54d'; // amarillo cálido
      this.centerColor = '#f6c84c';
      this.birth = performance.now() + rand(0,300);
      this.duration = 900 + Math.random()*600;
      this.sway = rand(0.6,1.6);
    }
    draw(t){
      const age = t - this.birth;
      let prog = Math.max(0, Math.min(1, age/this.duration));
      const a = easeOutBack(prog);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale * a, this.scale * a);
      // slight sway
      const sway = Math.sin((t/700 + this.phase) * this.sway) * 6 * (1-prog);
      ctx.rotate(sway * Math.PI/180);
      // petals
      for(let i=0;i<this.petalCount;i++){
        const ang = (i/this.petalCount) * Math.PI*2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.bezierCurveTo(this.petalWid*0.6, -this.petalLen*0.2, this.petalWid*0.9, -this.petalLen*0.9, 0, -this.petalLen);
        ctx.bezierCurveTo(-this.petalWid*0.9, -this.petalLen*0.9, -this.petalWid*0.6, -this.petalLen*0.2, 0,0);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, -this.petalLen, 0, 0);
        g.addColorStop(0, '#fff89b');
        g.addColorStop(0.5, this.color);
        g.addColorStop(1, '#f1c94a');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
      }
      // center
      ctx.beginPath();
      ctx.arc(0,0, this.petalWid*0.9, 0, Math.PI*2);
      ctx.fillStyle = this.centerColor;
      ctx.fill();
      ctx.restore();
    }
  }

  class Bouquet {
    constructor(){
      this.flowers = [];
      this.created = performance.now();
    }
    generate(centerX, centerY, addMode = false){
      if (!addMode) this.flowers.length = 0;
      const n = Math.floor(rand(5,10));
      const spread = Math.min(innerWidth, innerHeight) * 0.22;
      for(let i=0;i<n;i++){
        const angle = rand(-Math.PI*0.45, Math.PI*1.45);
        const r = Math.abs(rand(0,1)) * rand(10, spread);
        const x = centerX + Math.cos(angle)*r + rand(-12,12);
        const y = centerY + Math.sin(angle)*r + rand(-8,18);
        const s = rand(0.9,1.6) * (1 - (Math.abs(r)/spread)*0.45);
        const f = new Flower(x, y, s);
        f.birth += i*80;
        this.flowers.push(f);
      }
    }
    draw(t){
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      for(let f of this.flowers){
        ctx.beginPath();
        ctx.moveTo(f.x, f.y + 6);
        ctx.quadraticCurveTo((f.x+innerWidth/2)/2, innerHeight - 40, innerWidth/2, innerHeight - 20);
        ctx.lineWidth = 4 * f.scale;
        ctx.strokeStyle = '#2c5f2b';
        ctx.stroke();
      }
      ctx.restore();

      for(let f of this.flowers) f.draw(t);

      // ribbon
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(innerWidth/2 - 60, innerHeight - 26);
      ctx.lineTo(innerWidth/2 + 60, innerHeight - 26);
      ctx.lineWidth = 18;
      ctx.strokeStyle = '#b33a3a';
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  }

  let bouquet = new Bouquet();
  bouquet.generate(innerWidth/2, innerHeight/2 - 40);

  // 🌟 fondo decorado 🌟
  const stars = Array.from({length: 80}, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.5 + 0.5,
    twinkle: Math.random() * 1000
  }));

  function drawBg(t){
    // gradiente animado
    const g = ctx.createLinearGradient(0, 0, 0, innerHeight);
    const shift = Math.sin(t / 5000) * 0.05;
    g.addColorStop(0, `rgba(8,17,38,1)`);
    g.addColorStop(1, `rgba(${7+shift*50},16,34,1)`);
    ctx.fillStyle = g;
    ctx.fillRect(0,0,innerWidth,innerHeight);

    // estrellas parpadeantes
    for (let s of stars) {
      const alpha = 0.5 + 0.5 * Math.sin((t + s.twinkle) / 700);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,200,${alpha})`;
      ctx.fill();
    }

    // aura pulsante detrás del ramo
    const pulse = 0.15 + 0.05 * Math.sin(t / 1000);
    const rg = ctx.createRadialGradient(
      innerWidth/2, innerHeight/2 - 40, 10,
      innerWidth/2, innerHeight/2 - 40,
      Math.min(innerWidth,innerHeight) * 0.7
    );
    rg.addColorStop(0, `rgba(255,244,200,${0.2 + pulse})`);
    rg.addColorStop(0.25, 'rgba(255,244,200,0.08)');
    rg.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0,0,innerWidth,innerHeight);
  }

  let last = performance.now();
  function frame(now){
    const dt = now - last; last = now;
    drawBg(now);
    bouquet.draw(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // regenerate on tap/click (modo acumulativo)
  function regen(e){
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    bouquet.generate(x || innerWidth/2, (y || innerHeight/2) - 40, true);
  }
  canvas.addEventListener('click', regen);
  canvas.addEventListener('touchstart', function(ev){ ev.preventDefault(); regen(ev); }, {passive:false});

})();