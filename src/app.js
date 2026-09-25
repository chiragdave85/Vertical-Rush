import {StackGame} from './engine.js';
import {Soundscape} from './audio.js';
import {Scene} from './scene.js';

const $ = id => document.getElementById(id);
// Persist block heights so existing records convert to points without migration.
const points = height => height * 10;
const store = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
  },
};
const raw = store.read('vertical-rush-settings', {});
const settings = {
  enabled: raw?.enabled !== false,
  music: Number.isFinite(raw?.music) ? Math.min(1, Math.max(0, raw.music)) : .35,
  effects: Number.isFinite(raw?.effects) ? Math.min(1, Math.max(0, raw.effects)) : .65,
};
const audio = new Soundscape(settings);
const scene = new Scene($('game-canvas'));
let mode = 'classic', phase = 'home', last = performance.now(), lastPlace = 0;
let feedbackUntil = 0;
const game = new StackGame(mode);
let best = store.read('vertical-rush-bests', {});
if (!best || typeof best !== 'object') best = {};
for (const key of ['classic', 'zen']) {
  if (!Number.isSafeInteger(best[key]) || best[key] < 0) best[key] = 0;
}

function updateScore() {
  $('score').textContent = points(game.score);
  $('header-best').textContent = points(best[mode]);
}
function saveSettings() {
  audio.apply();
  store.write('vertical-rush-settings', settings);
}
function setTheme(theme) {
  if (!['neon', 'lavender', 'mint', 'peach'].includes(theme)) theme = 'neon';
  scene.theme = theme;
  document.body.dataset.theme = theme;
  document.querySelectorAll('[data-palette]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.palette === theme));
  });
  $('theme-name').textContent = theme[0].toUpperCase() + theme.slice(1);
  store.write('vertical-rush-neon-theme', theme);
}
function setPhase(next) {
  phase = next;
  document.body.dataset.phase = phase;
  $('start-screen').hidden = phase !== 'home';
  $('score-hud').hidden = phase === 'home' || phase === 'over';
  $('pause-button').hidden = phase !== 'playing';
  $('place-button').hidden = phase !== 'playing';
  $('game-overlay').hidden = phase === 'home' || phase === 'playing';
  $('control-hint').textContent = phase === 'home'
    ? 'SPACE TO START · HEADPHONES RECOMMENDED'
    : phase === 'over' ? 'YOUR TOWER. ONE LAST LOOK.'
    : phase === 'paused' ? 'P TO RESUME'
    : 'TAP OR SPACE TO PLACE · P TO PAUSE';
  document.querySelectorAll('[data-mode]').forEach(button => button.disabled = phase !== 'home');
  $('mode-description').textContent = phase !== 'home'
    ? 'Return to the start to change your mode.'
    : mode === 'classic' ? 'A steady rhythm. One chance to land it.' : 'A slower flow. Unlimited retries.';
}
function start() {
  if (phase === 'playing') return;
  game.reset(mode);
  scene.reset();
  setPhase('playing');
  lastPlace = performance.now();
  $('feedback').textContent = '';
  updateScore();
  audio.unlock().then(() => {
    if (phase !== 'playing' || document.hidden) return;
    audio.effect('start');
    audio.play();
  });
  $('place-button').focus({preventScroll:true});
}
function showOverlay(paused) {
  $('result-stats').hidden = paused;
  $('overlay-eyebrow').textContent = paused ? 'TAKE A BREATH'
    : game.score > 0 && game.score === best[mode] ? 'PERSONAL BEST' : 'ONE MORE CHANCE TO RISE';
  $('overlay-title').textContent = paused ? 'PAUSED' : 'GAME OVER';
  $('overlay-copy').textContent = paused ? 'Your tower will be right here.' : `Personal best: ${points(best[mode])} points`;
  $('result-score').textContent = points(game.score);
  $('result-perfect').textContent = game.perfects;
  $('resume-button').innerHTML = `${paused ? 'RESUME' : 'PLAY AGAIN'} <svg aria-hidden="true"><use href="#arrow"/></svg>`;
  $('resume-button').focus({preventScroll:true});
}
function pause() {
  if (phase !== 'playing') return;
  game.state = 'paused';
  setPhase('paused');
  audio.suspend();
  showOverlay(true);
}
function resume() {
  if (phase !== 'paused') return;
  game.state = 'playing';
  setPhase('playing');
  lastPlace = performance.now();
  audio.unlock().then(() => {
    if (phase === 'playing' && !document.hidden) audio.play();
  });
  $('place-button').focus({preventScroll:true});
}
function home() {
  audio.pause();
  scene.reset();
  setPhase('home');
  updateScore();
  $('play-button').focus({preventScroll:true});
}
function place() {
  if (phase !== 'playing' || performance.now() - lastPlace < 160) return;
  lastPlace = performance.now();
  const result = game.place();
  if (!result) return;
  scene.drop(result.piece);
  audio.effect(result.type, game.streak);
  if (result.type === 'perfect') scene.perfect(result.block);
  if (game.score > best[mode]) {
    best[mode] = game.score;
    store.write('vertical-rush-bests', best);
  }
  updateScore();
  $('feedback').textContent = result.type === 'perfect'
    ? `PERFECT${game.streak > 1 ? ' × ' + game.streak : ''}`
    : result.type === 'retry' ? 'BREATHE. TRY AGAIN.' : '';
  $('feedback').style.opacity = '1';
  feedbackUntil = performance.now() + 1100;
  if (result.type === 'over') {
    scene.beginFinale();
    setPhase('over');
    audio.pause();
    showOverlay(false);
  }
}
$('play-button').addEventListener('click', start);
$('place-button').addEventListener('click', place);
$('game-canvas').addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  if (phase === 'home') start();
  else if (phase === 'playing') place();
});
$('pause-button').addEventListener('click', pause);
$('resume-button').addEventListener('click', () => phase === 'paused' ? resume() : start());
$('home-button').addEventListener('click', home);
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  if (phase !== 'home') return;
  mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  $('arena-mode').textContent = mode.toUpperCase();
  setPhase('home');
  updateScore();
}));
document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.palette)));
for (const [button, dialog] of [['how-button', 'help-dialog'], ['settings-button', 'settings-dialog']]) {
  $(button).addEventListener('click', () => { pause(); $(dialog).showModal(); });
}
$('sound-enabled').checked = settings.enabled;
$('sound-enabled').addEventListener('change', event => {
  settings.enabled = event.target.checked;
  saveSettings();
  if (settings.enabled) audio.unlock().then(() => audio.effect('ui'));
});
for (const kind of ['music', 'effects']) {
  $(kind + '-volume').value = Math.round(settings[kind] * 100);
  $(kind + '-value').value = Math.round(settings[kind] * 100) + '%';
  $(kind + '-volume').addEventListener('input', event => {
    settings[kind] = Number(event.target.value) / 100;
    $(kind + '-value').value = event.target.value + '%';
    saveSettings();
  });
  $(kind + '-volume').addEventListener('change', () => audio.unlock().then(() => {
    if (kind === 'effects') audio.effect('perfect', 1);
    else audio.note(329.63, 0, 1, .2, audio.music);
  }));
}
document.addEventListener('click', event => {
  if (event.target.closest('button') && !event.target.closest('#place-button,#play-button,#resume-button,#pause-button')) {
    audio.unlock().then(() => audio.effect('ui'));
  }
});
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.target.matches('input,textarea,select')) return;
  if (event.repeat) { if (event.code === 'Space') event.preventDefault(); return; }
  if (event.code === 'Escape' || event.code === 'KeyP') {
    event.preventDefault();
    if (phase === 'playing') pause(); else if (phase === 'paused') resume();
    return;
  }
  if (event.code === 'Space' && event.target.tagName !== 'BUTTON') {
    event.preventDefault();
    if (phase === 'home') start(); else if (phase === 'playing') place();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pause(); audio.suspend(); }
});
window.addEventListener('pagehide', () => audio.suspend());
setTheme(store.read('vertical-rush-neon-theme', 'neon'));
saveSettings();
updateScore();
function frame(now) {
  const dt = Math.min((now - last) / 1000, .05);
  last = now;
  if (!document.hidden) {
    if (phase === 'playing') game.tick(dt);
    if (feedbackUntil && now > feedbackUntil) $('feedback').style.opacity = '0';
    scene.draw(game, phase === 'paused' || document.querySelector('dialog[open]') ? 0 : dt, now, phase === 'home');
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
