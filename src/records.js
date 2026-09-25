// Records belong to this browser's player. Never infer ownership of legacy data.
const modes = ['classic', 'zen'];
export function cleanRecords(value) {
  return Object.fromEntries(modes.map(mode => [mode,
    Number.isSafeInteger(value?.[mode]) && value[mode] >= 0 && value[mode] <= Number.MAX_SAFE_INTEGER / 10 ? value[mode] : 0]));
}
export function playerRecords(store, createId = () => crypto.randomUUID()) {
  let id = store.read('vertical-rush-player', null);
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(id)) {
    id = createId();
    store.write('vertical-rush-player', id);
  }
  const key = `vertical-rush-player-bests:${id}`;
  let best = cleanRecords(store.read(key, {}));
  return {
    get best() { return best; },
    save(mode, height) {
      if (!modes.includes(mode)) return;
      best[mode] = Math.max(best[mode], cleanRecords({[mode]: height})[mode]);
      store.write(key, best);
    },
    restoreLegacy() {
      const legacy = cleanRecords(store.read('vertical-rush-bests', {}));
      for (const mode of modes) this.save(mode, legacy[mode]);
    },
    reset() { best = cleanRecords({}); store.write(key, best); },
  };
}
