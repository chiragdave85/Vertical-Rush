/** Visible walls follow the camera through every quadrant of its orbit. */
export function visibleWalls(sin, cos) {
  return { x: sin >= 0 ? 'max' : 'min', z: cos >= 0 ? 'max' : 'min' };
}

export function finaleFrame(blocks, focal, viewportHeight, pitch) {
  const bottom = blocks[0].y - 29;
  const top = blocks.at(-1).y;
  const height = top - bottom;
  return {
    center: (top + bottom) / 2,
    distance: Math.max(1160, height * 1.1 * focal / (viewportHeight * .65) + height * pitch / 2 + 240),
  };
}

const COLORS = {
  neon: [114, 247, 250],
  lavender: [196, 168, 255],
  mint: [160, 243, 206],
  peach: [255, 198, 166],
};

/** Perspective projection and luminous geometry, without a WebGL dependency. */
export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.theme = 'neon';
    this.camera = 0;
    this.yaw = .24;
    this.pitch = .26;
    this.elapsed = 0;
    this.distance = 1160;
    this.finaleTime = null;
    this.pieces = [];
    this.rings = [];
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    this.w = bounds.width;
    this.h = bounds.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  color(factor = 1, alpha = 1) {
    const color = COLORS[this.theme] || COLORS.neon;
    return `rgba(${color.map(v => Math.min(255, Math.round(v * factor))).join(',')},${alpha})`;
  }

  point(x, z, y) {
    const horizontal = x * this.cos - z * this.sin;
    const toward = x * this.sin + z * this.cos;
    const vertical = y - this.camera;
    const depth = this.distance - toward * this.forward - vertical * this.pitch;
    if (depth < 65) return null;
    const scale = this.focal / depth;
    return {
      x: this.w / 2 + horizontal * scale,
      y: this.h * .565 + (toward * this.pitch - vertical * this.forward) * scale,
      depth,
    };
  }

  polygon(points, color, glow = 0, edge = false) {
    if (points.some(p => !p)) return;
    const c = this.ctx;
    c.beginPath();
    points.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y));
    c.closePath();
    c.shadowColor = this.color(1, .7);
    c.shadowBlur = glow;
    c.fillStyle = color;
    c.fill();
    c.shadowBlur = 0;
    if (edge) { c.strokeStyle = this.color(1.1, .32); c.lineWidth = .65; c.stroke(); }
  }

  block(b, active = false, alpha = 1) {
    const c = this.ctx;
    c.globalAlpha = alpha;
    const p = (x, z, y) => this.point(x, z, y);
    const a = p(b.x, b.z, b.y), d = p(b.x + b.w, b.z, b.y);
    const e = p(b.x + b.w, b.z + b.d, b.y), f = p(b.x, b.z + b.d, b.y);
    const ab = p(b.x, b.z, b.y - 29);
    const db = p(b.x + b.w, b.z, b.y - 29);
    const eb = p(b.x + b.w, b.z + b.d, b.y - 29);
    const fb = p(b.x, b.z + b.d, b.y - 29);
    const walls = visibleWalls(this.sin, this.cos);
    this.polygon(walls.z === 'max' ? [f, e, eb, fb] : [a, d, db, ab], this.color(active ? .77 : .40), active ? 12 : 0);
    this.polygon(walls.x === 'max' ? [d, e, eb, db] : [a, f, fb, ab], this.color(active ? .9 : .51), active ? 12 : 0);
    this.polygon([a, d, e, f], this.color(active ? 1.06 : .72), active ? 30 : 6, true);
    c.globalAlpha = 1;
  }

  grid() {
    const c = this.ctx;
    // Batch segments by depth and line weight to keep the floor cheap to draw.
    const groups = Array.from({length: 10}, () => []);
    for (let fixed = -2400; fixed <= 1200; fixed += 60) {
      const major = fixed % 300 === 0;
      for (let step = -2400; step < 1200; step += 240) {
        for (let axis = 0; axis < 2; axis++) {
          const a = axis ? this.point(step, fixed, -32) : this.point(fixed, step, -32);
          const b = axis ? this.point(step + 240, fixed, -32) : this.point(fixed, step + 240, -32);
          if (!a || !b) continue;
          if (a.y < this.h * .22 && b.y < this.h * .22) continue;
          const depth = (a.depth + b.depth) / 2;
          const band = Math.max(0, Math.min(4, Math.floor((depth - 300) / 650)));
          groups[band * 2 + Number(major)].push([a, b]);
        }
      }
    }
    groups.forEach((lines, i) => {
      const major = i % 2 === 1, band = Math.floor(i / 2);
      const rgb = (COLORS[this.theme] || COLORS.neon).map((v, channel) => Math.round(v * [ .7, .8, 1 ][channel]));
      c.strokeStyle = `rgba(${rgb.join(',')},${(major ? .95 : .25) * (1 - band * .19)})`;
      c.lineWidth = major ? 1.1 : .5;
      c.beginPath();
      for (const [a,b] of lines) { c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); }
      c.stroke();
    });
    const fog = c.createLinearGradient(0, this.h * .19, 0, this.h * .7);
    fog.addColorStop(0, '#05070b');
    fog.addColorStop(.18, '#05070bf5');
    fog.addColorStop(.58, '#05070b30');
    fog.addColorStop(1, '#05070b00');
    c.fillStyle = fog;
    c.fillRect(0, 0, this.w, this.h);
  }

  drop(piece) {
    if (piece && !this.reduced) {
      const dir = piece.x + piece.w / 2 > 0 ? 1 : -1;
      this.pieces.push({...piece, vy: 0, vx: dir * 60, life: 1});
    }
  }

  perfect(block) {
    if (!this.reduced) this.rings.push({x: block.x + block.w / 2, z: block.z + block.d / 2, y: block.y, life: 1});
  }

  reset() {
    this.camera = 0;
    this.distance = 1160;
    this.finaleTime = null;
    this.yaw = Math.PI / 4;
    this.pieces = [];
    this.rings = [];
  }

  beginFinale() {
    // Capture the actual rendered angle so the orbit starts without a jump.
    this.yaw += this.reduced ? 0 : Math.sin(this.elapsed * .12) * .06;
    this.finaleTime = 0;
  }

  draw(game, dt, time, preview = false) {
    if (!this.w || !this.h) return;
    const c = this.ctx, w = this.w, h = this.h;
    this.elapsed += dt;
    const blend = this.reduced ? 1 : 1 - Math.exp(-dt * 3);
    const finale = this.finaleTime !== null && !preview;
    if (finale) {
      const before = this.finaleTime;
      this.finaleTime += dt;
      // Smoothly reach 0.12 rad/s (one orbit in roughly 52 seconds).
      if (!this.reduced) {
        const easedTime = t => t - .8 * (1 - Math.exp(-t / .8));
        this.yaw += .12 * (easedTime(this.finaleTime) - easedTime(before));
      }
    } else {
      this.yaw += ((preview ? .24 : Math.PI / 4) - this.yaw) * blend;
    }
    this.pitch += ((preview ? .26 : .572) - this.pitch) * blend;
    this.forward = Math.sqrt(1 - this.pitch * this.pitch);
    const angle = this.yaw + (this.reduced || finale ? 0 : Math.sin(this.elapsed * .12) * .06);
    this.sin = Math.sin(angle);
    this.cos = Math.cos(angle);
    this.focal = Math.min(h * 1.2, w * 1.65);
    const framing = finale ? finaleFrame(game.blocks, this.focal, h, this.pitch) : null;
    const target = framing ? framing.center : preview ? 0 : Math.max(0, (game.blocks.at(-1)?.y || 0) - 100);
    const cameraBlend = this.reduced ? 1 : 1 - Math.exp(-dt * (finale ? 1.7 : 5));
    this.camera += (target - this.camera) * cameraBlend;
    this.distance += ((framing?.distance || 1160) - this.distance) * cameraBlend;
    c.fillStyle = '#05070b';
    c.fillRect(0, 0, w, h);
    const light = c.createRadialGradient(w * .5, h * .55, 0, w * .5, h * .55, Math.max(w,h) * .5);
    light.addColorStop(0, this.color(.5, preview ? .07 : .14));
    light.addColorStop(1, '#05070b00');
    c.fillStyle = light;
    c.fillRect(0, 0, w, h);
    this.grid();
    if (!preview) {
      for (const block of game.blocks) {
        const p = this.point(block.x, block.z, block.y);
        if (p && p.y < h + 100 && p.y > -200) this.block(block);
      }
      if (game.current) {
        const b = game.current, p = this.point(b.x + b.w / 2, b.z + b.d / 2, b.y);
        if (p) {
          const bloom = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.min(w, h) * .27);
          bloom.addColorStop(0, this.color(1, .15));
          bloom.addColorStop(1, this.color(1, 0));
          c.fillStyle = bloom;
          c.fillRect(0, 0, w, h);
        }
        this.block(game.current, true);
      }
    }
    this.pieces = this.pieces.filter(p => p.life > 0);
    for (const piece of this.pieces) {
      piece.vy += 850 * dt;
      piece.y -= piece.vy * dt;
      piece.x += piece.vx * dt;
      piece.life -= dt * .8;
      this.block(piece, true, Math.max(0, piece.life));
    }
    this.rings = this.rings.filter(r => r.life > 0);
    for (const ring of this.rings) {
      ring.life -= dt * 1.5;
      c.strokeStyle = this.color(1, Math.max(0, ring.life));
      c.lineWidth = 1.5;
      c.beginPath();
      const radius = (1 - ring.life) * 270;
      for (let i=0; i<=48; i++) {
        const angle = i / 48 * Math.PI * 2;
        const p = this.point(ring.x + Math.cos(angle) * radius, ring.z + Math.sin(angle) * radius, ring.y);
        if (p) i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
      }
      c.stroke();
    }
    const vignette = c.createRadialGradient(w/2,h*.52,Math.min(w,h)*.15,w/2,h*.52,Math.max(w,h)*.65);
    vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#000000b0');
    c.fillStyle = vignette;c.fillRect(0,0,w,h);
  }
}
