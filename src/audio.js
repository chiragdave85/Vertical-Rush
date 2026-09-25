/** Original procedural score: pentatonic bells, warm pads, and a soft pulse. */
export class Soundscape {
  constructor(settings) { this.settings = settings; this.step = 0; this.active = false; }
  async unlock() {
    try {
      if (!this.ctx) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        this.ctx = new Audio();
        this.music = this.ctx.createGain(); this.fx = this.ctx.createGain();
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -18; compressor.ratio.value = 4;
        this.music.connect(compressor); this.fx.connect(compressor); compressor.connect(this.ctx.destination);
        this.apply();
      }
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch { /* Audio is optional; gameplay stays available. */ }
  }
  apply() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.music.gain.setTargetAtTime(this.settings.enabled ? this.settings.music * .3 : 0,t,.08);
    this.fx.gain.setTargetAtTime(this.settings.enabled ? this.settings.effects * .45 : 0,t,.025);
  }
  note(freq, delay = 0, duration = .5, volume = .25, bus = this.fx, type = 'sine') {
    if (!this.ctx || !this.settings.enabled || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(volume,t+.015);
    gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    osc.connect(gain); gain.connect(bus); osc.start(t); osc.stop(t+duration+.05);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  effect(kind, streak=0) {
    const scale = [261.63,293.66,329.63,392,440,523.25,587.33,659.25];
    if (kind === 'perfect') { const root = scale[Math.min(streak,7)]; [1,1.25,1.5,2].forEach((v,i)=>this.note(root*v,i*.055,.8,.2)); }
    else if(kind === 'placed') {this.note(scale[this.step%5],0,.45,.45);this.note(130.81,0,.14,.3);}
    else if(kind === 'over') [392,329.63,261.63,196].forEach((f,i)=>this.note(f,i*.13,1,.23));
    else if(kind === 'start') [261.63,329.63,392,523.25].forEach((f,i)=>this.note(f,i*.09,.7,.23));
    else if(kind === 'retry') {this.note(293.66,0,.4,.25);this.note(261.63,.12,.6,.2);}
    else {this.note(659.25,0,.12,.12);this.note(880,.035,.12,.08);}
  }
  play() {
    if(this.active) return;
    this.active = true;
    this.timer = setInterval(() => {
      if(!this.ctx || !this.settings.enabled || document.hidden) return;
      const melody = [0,2,4,2,1,3,4,6,4,2,1,3,2,0,1,2];
      const notes = [261.63,293.66,329.63,392,440,523.25,587.33];
      this.note(notes[melody[this.step%16]],0,1.1,.12,this.music,'triangle');
      if(this.step%8===0) [130.81,164.81,196].forEach(f=>this.note(f,0,3.4,.12,this.music));
      if(this.step%2===0) this.note(65.41,0,.18,.23,this.music);
      this.step++;
    },375);
  }
  pause() { clearInterval(this.timer); this.active = false; }
  async suspend() {this.pause();try {if(this.ctx?.state === 'running') await this.ctx.suspend();} catch {}}
}
