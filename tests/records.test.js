import test from 'node:test';
import assert from 'node:assert/strict';
import {playerRecords, cleanRecords} from '../src/records.js';
const storage = () => { const data = new Map(); return {read:(k,f)=>data.has(k)?structuredClone(data.get(k)):f, write:(k,v)=>data.set(k,structuredClone(v))}; };
test('new player starts at zero even when unowned legacy record is 160 points',()=>{
 const store=storage();store.write('vertical-rush-bests',{classic:16});
 const player=playerRecords(store,()=> 'player-one');assert.equal(player.best.classic,0);
 player.restoreLegacy();assert.equal(player.best.classic,16);
});
test('personal records survive reload and never appear in another browser',()=>{
 const a=storage(),b=storage();const first=playerRecords(a,()=> 'a');
 first.save('classic',16);first.save('classic',2);first.save('zen',8);
 assert.deepEqual(playerRecords(a).best,{classic:16,zen:8});
 assert.deepEqual(playerRecords(b,()=> 'b').best,{classic:0,zen:0});
 first.reset();assert.deepEqual(playerRecords(a).best,{classic:0,zen:0});
});
test('corrupt score data cannot become a personal best',()=>{
 for(const value of [null,160,{classic:-1,zen:'160'},{classic:Infinity,zen:1.5}]) assert.deepEqual(cleanRecords(value),{classic:0,zen:0});
});
