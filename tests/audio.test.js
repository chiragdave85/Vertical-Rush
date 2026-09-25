import test from 'node:test';
import assert from 'node:assert/strict';
import {Soundscape} from '../src/audio.js';
const settings=()=>({enabled:true,music:.35,effects:.65});
test('resumes both suspended Android and interrupted iOS audio',async()=>{
 for(const state of ['suspended','interrupted']) {
  const sound=new Soundscape(settings());let calls=0;
  sound.ctx={state,async resume(){calls++;this.state='running';}};
  assert.equal(await sound.unlock(),true);assert.equal(calls,1);
 }
});
test('failed mobile unlock can be retried on the next tap',async()=>{
 const sound=new Soundscape(settings());let calls=0;
 sound.ctx={state:'suspended',async resume(){if(++calls===1)throw Error('blocked');this.state='running';}};
 assert.equal(await sound.unlock(),false);assert.equal(await sound.unlock(),true);
});
test('saved mute does not resume audio',async()=>{
 const sound=new Soundscape({...settings(),enabled:false});
 sound.ctx={state:'suspended',resume(){throw Error('must not resume');}};
 assert.equal(await sound.unlock(),false);
});
test('music starts immediately with original melody and does not duplicate timers',()=>{
 globalThis.document={hidden:false};const sound=new Soundscape(settings());sound.ctx={state:'running'};
 const notes=[];sound.note=(...args)=>notes.push(args);
 try {sound.play();assert.equal(notes[0][0],261.63);assert.equal(notes.length,5);const timer=sound.timer;sound.play();assert.equal(sound.timer,timer);} finally {sound.pause();delete globalThis.document;}
});
