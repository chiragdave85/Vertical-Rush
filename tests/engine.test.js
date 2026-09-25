import test from 'node:test';
import assert from 'node:assert/strict';
import {StackGame, MOTION} from '../src/engine.js';
function align(g,offset=0){g.current[g.axis]=g.blocks.at(-1)[g.axis]+offset;}
test('perfect placements preserve dimensions and alternate axes',()=>{const g=new StackGame();align(g);assert.equal(g.place().type,'perfect');assert.equal(g.score,1);assert.equal(g.axis,'z');assert.equal(g.blocks.at(-1).w,180);align(g);g.place();assert.equal(g.axis,'x');assert.equal(g.streak,2);});
test('overhang clips exactly on either side and either axis',()=>{for(const sign of [-1,1]){const g=new StackGame();align(g,sign*30);let r=g.place();assert.equal(r.block.w,150);assert.equal(r.piece.w,30);align(g,sign*45);r=g.place();assert.equal(r.block.d,135);assert.equal(r.piece.d,45);assert.equal(r.block.w,150);}});
test('classic miss ends the run; future inputs cannot mutate it',()=>{const g=new StackGame();const r=g.place();assert.equal(r.type,'over');assert.equal(g.state,'over');assert.equal(g.current,null);assert.equal(g.place(),null);g.tick(1);assert.equal(g.score,0);});
test('Zen miss preserves tower and permits another attempt',()=>{const g=new StackGame('zen');assert.equal(g.place().type,'retry');assert.equal(g.state,'playing');align(g);g.place();assert.equal(g.score,1);});
test('movement is frame-rate independent',()=>{const a=new StackGame(),b=new StackGame();for(let i=0;i<60;i++)a.tick(1/60);for(let i=0;i<120;i++)b.tick(1/120);assert.ok(Math.abs(a.current.x-b.current.x)<1e-8);});
test('pause freezes movement and placements',()=>{const g=new StackGame();g.state='paused';const x=g.current.x;g.tick(1);assert.equal(g.current.x,x);assert.equal(g.place(),null);});
test('narrow blocks do not accept a non-overlapping perfect placement',()=>{const g=new StackGame();g.blocks[0].w=3;g.current.w=3;align(g,4);assert.equal(g.place().type,'over');});
test('long sessions bound tower storage; reset clears score and streak',()=>{const g=new StackGame('zen');for(let i=0;i<200;i++){align(g);g.place();}assert.equal(g.score,200);assert.equal(g.blocks.length,90);assert.equal(g.blocks.at(-1).y,6000);g.reset('classic');assert.equal(g.score,0);assert.equal(g.perfects,0);assert.equal(g.blocks.length,1);});

test('Classic matches the reference sine period and amplitude',()=>{
  const g=new StackGame();
  assert.equal(g.current.x-g.center,-240);
  g.tick(Math.PI/4);
  assert.ok(Math.abs(g.current.x-g.center)<1e-9);
  g.tick(Math.PI/4);
  assert.ok(Math.abs(g.current.x-g.center-240)<1e-9);
  g.tick(Math.PI/2);
  assert.ok(Math.abs(g.current.x-g.center+240)<1e-9);
  assert.equal(MOTION.classicRate,2);
});
test('speed stays steady as height increases and phase survives spawn',()=>{
  const a=new StackGame(),b=new StackGame();
  a.tick(.7);b.tick(.7);
  for(let i=0;i<20;i++){align(b);b.place();}
  a.tick(.2);b.tick(.2);
  assert.ok(Math.abs((a.current[a.axis]-a.center)-(b.current[b.axis]-b.center))<1e-9);
});
test('Zen has a slower sine period and invalid deltas do not corrupt motion',()=>{
  const g=new StackGame('zen');
  g.tick(Math.PI/(2*MOTION.zenRate));
  assert.ok(Math.abs(g.current.x-g.center)<1e-9);
  const x=g.current.x;
  for(const dt of [NaN,Infinity,-1,0])g.tick(dt);
  assert.equal(g.current.x,x);
});
