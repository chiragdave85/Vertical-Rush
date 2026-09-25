/** Pure world-space rules. Rendering and input never change these coordinates. */
export const MOTION = Object.freeze({ amplitude: 240, classicRate: 2, zenRate: 1.15 });

export class StackGame {
  constructor(mode = 'classic') { this.reset(mode); }
  reset(mode = this.mode) {
    this.mode = mode; this.score = 0; this.perfects = 0; this.streak = 0;
    this.state = 'playing'; this.elapsed = 0;
    this.blocks = [{x:-90,z:-90,w:180,d:180,y:0,index:0}];
    this.spawn();
  }
  spawn() {
    const top = this.blocks.at(-1);
    this.axis = this.score % 2 === 0 ? 'x' : 'z';
    this.center = top[this.axis];
    this.current = {...top, y:top.y + 30, index:this.score + 1};
    this.current[this.axis] = this.center + this.offset();
  }
  offset() {
    const rate = this.mode === 'zen' ? MOTION.zenRate : MOTION.classicRate;
    return Math.sin(this.elapsed * rate - Math.PI / 2) * MOTION.amplitude;
  }
  tick(dt) {
    if (this.state !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    this.elapsed += dt;
    // Continuous phase carries across placements: no acceleration or edge snap.
    this.current[this.axis] = this.center + this.offset();
  }
  place() {
    if (this.state !== 'playing') return null;
    const top = this.blocks.at(-1), b = {...this.current}, axis = this.axis;
    const size = axis === 'x' ? 'w' : 'd';
    const delta = b[axis] - top[axis];
    const overlap = top[size] - Math.abs(delta);
    if (overlap <= 0) {
      this.streak = 0;
      if (this.mode === 'zen') this.spawn(); else { this.state = 'over'; this.current = null; }
      return {type:this.mode === 'zen' ? 'retry' : 'over', piece:b};
    }
    const perfect = Math.abs(delta) <= Math.min(6, top[size] * .18);
    let piece = null;
    if (perfect) {
      b[axis] = top[axis]; this.perfects++; this.streak++;
    } else {
      this.streak = 0;
      piece = {...b, [size]:Math.abs(delta)};
      b[axis] = Math.max(b[axis],top[axis]); b[size] = overlap;
      piece[axis] = delta < 0 ? this.current[axis] : b[axis] + overlap;
    }
    this.score++; this.blocks.push(b);
    // Keep memory bounded during long Zen sessions; world height remains absolute.
    if (this.blocks.length > 90) this.blocks.shift();
    this.spawn();
    return {type:perfect ? 'perfect' : 'placed', piece, block:b};
  }
}
