import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene, visibleWalls, finaleFrame} from '../src/scene.js';

test('orbit selects the outward-facing walls in all four quadrants', () => {
  assert.deepEqual(visibleWalls(1,1), {x:'max',z:'max'});
  assert.deepEqual(visibleWalls(1,-1), {x:'max',z:'min'});
  assert.deepEqual(visibleWalls(-1,-1), {x:'min',z:'min'});
  assert.deepEqual(visibleWalls(-1,1), {x:'min',z:'max'});
});
test('finale framing centers retained tower and pulls back for tall runs', () => {
  const short = finaleFrame([{y:0},{y:90}],864,720,.572);
  assert.equal(short.center,30.5);
  assert.equal(short.distance,1160);
  const tall = finaleFrame([{y:0},{y:2670}],864,720,.572);
  assert.equal(tall.center,1320.5);
  assert.ok(tall.distance>5000);
  const retained = finaleFrame([{y:900},{y:3570}],864,720,.572);
  assert.equal(retained.distance,tall.distance);
  assert.equal(retained.center,tall.center+900);
});

function mockScene(reduced=false) {
  const noop=()=>{};
  const gradient={addColorStop:noop};
  const scene=Object.create(Scene.prototype);
  Object.assign(scene,{w:1280,h:720,ctx:{fillRect:noop,createRadialGradient:()=>gradient},
    theme:'neon',camera:0,yaw:.8,pitch:.572,elapsed:10,distance:1160,
    finaleTime:null,pieces:[],rings:[],reduced,grid:noop,block:noop});
  return scene;
}
const endedGame={blocks:[{x:-90,z:-90,w:180,d:180,y:0},{x:-90,z:-90,w:180,d:180,y:300}],current:null};
test('finale rotation is continuous, frame-rate independent and does not mutate the tower',()=>{
  const a=mockScene(),b=mockScene();
  const renderedAngle=a.yaw+Math.sin(a.elapsed*.12)*.06;
  a.beginFinale();b.beginFinale();assert.equal(a.yaw,renderedAngle);
  const original=structuredClone(endedGame);
  for(let i=0;i<120;i++)a.draw(endedGame,1/60,0);
  for(let i=0;i<240;i++)b.draw(endedGame,1/120,0);
  assert.ok(a.yaw>renderedAngle);
  assert.ok(Math.abs(a.yaw-b.yaw)<1e-10);
  assert.deepEqual(endedGame,original);
});
test('reduced motion holds orientation and restart clears finale state',()=>{
  const scene=mockScene(true);scene.beginFinale();const angle=scene.yaw;
  for(let i=0;i<120;i++)scene.draw(endedGame,1/60,0);
  assert.equal(scene.yaw,angle);
  scene.reset();assert.equal(scene.finaleTime,null);assert.equal(scene.distance,1160);
  assert.equal(scene.yaw,Math.PI/4);assert.equal(scene.camera,0);
});
