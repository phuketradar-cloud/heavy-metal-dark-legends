// Independent Match-3 logic: no knowledge of combat, UI or cards.
export const SIZE = 8;
export const TILE_TYPES = 6;
export type Special = 0 | 1 | 2; // 0 none, 1 line blast, 2 ultimate
export interface Tile {
  id: number; type: number; special: Special;
  dir?: 'h' | 'v';
  clearing?: boolean; fresh?: number; // fresh = rows above the board it drops from
}
export type Board = (Tile | null)[][];
export type Pos = [number, number];

let nextId = 1;
export const mk = (type: number, special: Special = 0, fresh?: number, dir?: 'h' | 'v'): Tile => ({
  id: nextId++, type, special, fresh, dir,
});
const rnd = (n: number) => Math.floor(Math.random() * n);
export const randType = () => rnd(TILE_TYPES);

export function cloneBoard(b: Board): Board {
  return b.map((row) => row.map((t) => (t ? { ...t } : null)));
}

export function createBoard(): Board {
  for (;;) {
    const b: Board = [];
    for (let r = 0; r < SIZE; r++) {
      b.push([]);
      for (let c = 0; c < SIZE; c++) {
        let t = randType();
        for (let guard = 0; guard < 20; guard++) {
          const hx = c >= 2 && b[r][c - 1]!.type === t && b[r][c - 2]!.type === t;
          const vx = r >= 2 && b[r - 1][c]!.type === t && b[r - 2][c]!.type === t;
          if (!hx && !vx) break;
          t = randType();
        }
        b[r].push(mk(t));
      }
    }
    if (findGroups(b).length === 0 && findHint(b)) return b;
  }
}

interface Run { type: number; cells: Pos[]; dir: 'h' | 'v' }
export interface Group { type: number; cells: Pos[]; size: number; dir: 'h' | 'v'; center: Pos; maxRun: number }

export function findGroups(b: Board): Group[] {
  const runs: Run[] = [];
  for (let r = 0; r < SIZE; r++) {
    let c = 0;
    while (c < SIZE) {
      const t = b[r][c]?.type;
      let e = c;
      while (t !== undefined && e + 1 < SIZE && b[r][e + 1]?.type === t) e++;
      if (t !== undefined && e - c >= 2) {
        const cells: Pos[] = [];
        for (let k = c; k <= e; k++) cells.push([r, k]);
        runs.push({ type: t, cells, dir: 'h' });
      }
      c = e + 1;
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let r = 0;
    while (r < SIZE) {
      const t = b[r][c]?.type;
      let e = r;
      while (t !== undefined && e + 1 < SIZE && b[e + 1][c]?.type === t) e++;
      if (t !== undefined && e - r >= 2) {
        const cells: Pos[] = [];
        for (let k = r; k <= e; k++) cells.push([k, c]);
        runs.push({ type: t, cells, dir: 'v' });
      }
      r = e + 1;
    }
  }
  // union runs that share a cell (L / T / + shapes)
  const parent = runs.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < runs.length; i++)
    for (let j = i + 1; j < runs.length; j++) {
      if (runs[i].type !== runs[j].type) continue;
      if (runs[i].cells.some(([r, c]) => runs[j].cells.some(([r2, c2]) => r === r2 && c === c2)))
        parent[find(i)] = find(j);
    }
  const map = new Map<number, Run[]>();
  runs.forEach((run, i) => {
    const k = find(i);
    map.set(k, [...(map.get(k) ?? []), run]);
  });
  const groups: Group[] = [];
  map.forEach((rs) => {
    const seen = new Map<string, Pos>();
    rs.forEach((r) => r.cells.forEach((p) => seen.set(p.join(','), p)));
    const cells = [...seen.values()];
    const longest = rs.reduce((a, b2) => (b2.cells.length > a.cells.length ? b2 : a));
    const center = longest.cells[Math.floor(longest.cells.length / 2)];
    groups.push({
      type: rs[0].type, cells, size: cells.length, dir: longest.dir, center, maxRun: longest.cells.length,
    });
  });
  return groups;
}

export function swapTiles(b: Board, a: Pos, c: Pos): Board {
  const n = cloneBoard(b);
  const t = n[a[0]][a[1]];
  n[a[0]][a[1]] = n[c[0]][c[1]];
  n[c[0]][c[1]] = t;
  return n;
}
export const adjacent = (a: Pos, b: Pos) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

/** A swap is valid when it creates a match, or when it involves a special tile. */
export function isValidSwap(b: Board, a: Pos, c: Pos): boolean {
  if (!adjacent(a, c)) return false;
  if (b[a[0]][a[1]]?.special || b[c[0]][c[1]]?.special) return true;
  return findGroups(swapTiles(b, a, c)).length > 0;
}

export function findHint(b: Board): [Pos, Pos] | null {
  let best: [Pos, Pos] | null = null;
  let bestScore = -1;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr, c2 = c + dc;
        if (r2 >= SIZE || c2 >= SIZE) continue;
        const a: Pos = [r, c], d: Pos = [r2, c2];
        if (!isValidSwap(b, a, d)) continue;
        const sp = (b[r][c]?.special ? 10 : 0) + (b[r2][c2]?.special ? 10 : 0);
        const g = findGroups(swapTiles(b, a, d));
        const score = sp + g.reduce((s, x) => s + x.size * (x.size >= 4 ? 3 : 1), 0);
        if (score > bestScore) { bestScore = score; best = [a, d]; }
      }
  return best;
}

export function shuffleBoard(b: Board): Board {
  for (let tries = 0; tries < 200; tries++) {
    const flat = b.flat().filter(Boolean) as Tile[];
    for (let i = flat.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    const nb: Board = [];
    let k = 0;
    for (let r = 0; r < SIZE; r++) {
      nb.push([]);
      for (let c = 0; c < SIZE; c++) nb[r].push({ ...flat[k++], clearing: false, fresh: undefined });
    }
    if (findGroups(nb).length === 0 && findHint(nb)) return nb;
  }
  return createBoard();
}

export interface Cleared { r: number; c: number; type: number; special: Special; collateral: boolean }
export interface StepResult {
  clearedBoard: Board; // tiles flagged `clearing`
  afterBoard: Board;   // after gravity + refill
  cleared: Cleared[];
  groups: { type: number; size: number; dir: 'h' | 'v' }[];
  activated: { kind: 'line' | 'ultimate' | 'area'; r: number; c: number; type: number }[];
  created: { r: number; c: number; special: Special; type: number }[];
  perType: number[];       // tiles matched directly, by type
  collateral: number[];    // tiles cleared by special effects, by type
}

/** Resolve one cascade iteration. Returns null when nothing to clear. `swapPos` = positions just swapped. */
export function resolveStep(board: Board, swapPos?: [Pos, Pos]): StepResult | null {
  const groups = findGroups(board);
  const clearSet = new Set<string>();
  const direct = new Set<string>();
  const activated: StepResult['activated'] = [];
  const created: StepResult['created'] = [];
  const keep = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  // specials swapped by the player activate immediately
  if (swapPos) {
    for (const [r, c] of swapPos) {
      const t = board[r][c];
      if (t?.special) { clearSet.add(key(r, c)); }
    }
  }
  for (const g of groups) {
    g.cells.forEach(([r, c]) => { clearSet.add(key(r, c)); direct.add(key(r, c)); });
    if (g.size >= 6) {
      const [cr, cc] = g.center;
      activated.push({ kind: 'area', r: cr, c: cc, type: g.type });
      for (let r = cr - 2; r <= cr + 2; r++)
        for (let c = cc - 2; c <= cc + 2; c++)
          if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) clearSet.add(key(r, c));
    } else if (g.size >= 4) {
      let pos: Pos = g.center;
      if (swapPos) {
        const hit = swapPos.find(([r, c]) => g.cells.some(([gr, gc]) => gr === r && gc === c));
        if (hit) pos = hit;
      }
      const sp: Special = g.size >= 5 ? 2 : 1;
      created.push({ r: pos[0], c: pos[1], special: sp, type: g.type });
      keep.add(key(pos[0], pos[1]));
    }
  }
  if (clearSet.size === 0) return null;

  // chain reaction: specials inside the clear set trigger their own effect
  const done = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const k of [...clearSet]) {
      if (done.has(k) || keep.has(k)) continue;
      const [r, c] = k.split(',').map(Number);
      const t = board[r][c];
      if (!t || !t.special) continue;
      done.add(k);
      if (t.special === 1) {
        activated.push({ kind: 'line', r, c, type: t.type });
        if (t.dir === 'v') for (let rr = 0; rr < SIZE; rr++) clearSet.add(key(rr, c));
        else for (let cc = 0; cc < SIZE; cc++) clearSet.add(key(r, cc));
        // a blast also clears the crossing line to feel "powerful"
        if (t.dir === 'v') for (let cc = Math.max(0, c - 1); cc <= Math.min(SIZE - 1, c + 1); cc++) clearSet.add(key(r, cc));
        else for (let rr = Math.max(0, r - 1); rr <= Math.min(SIZE - 1, r + 1); rr++) clearSet.add(key(rr, c));
      } else {
        activated.push({ kind: 'ultimate', r, c, type: t.type });
        for (let rr = 0; rr < SIZE; rr++)
          for (let cc = 0; cc < SIZE; cc++) if (board[rr][cc]?.type === t.type) clearSet.add(key(rr, cc));
        for (let rr = r - 1; rr <= r + 1; rr++)
          for (let cc = c - 1; cc <= c + 1; cc++)
            if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) clearSet.add(key(rr, cc));
      }
      grew = true;
    }
  }
  keep.forEach((k) => clearSet.delete(k));

  const cleared: Cleared[] = [];
  const perType = new Array(TILE_TYPES).fill(0);
  const collateral = new Array(TILE_TYPES).fill(0);
  const clearedBoard = cloneBoard(board);
  clearSet.forEach((k) => {
    const [r, c] = k.split(',').map(Number);
    const t = board[r][c];
    if (!t) return;
    const isDirect = direct.has(k);
    cleared.push({ r, c, type: t.type, special: t.special, collateral: !isDirect });
    if (isDirect) perType[t.type]++; else collateral[t.type]++;
    clearedBoard[r][c] = { ...t, clearing: true };
  });
  // create specials in-place (kept tiles)
  created.forEach(({ r, c, special, type }) => {
    const g = groups.find((gg) => gg.cells.some(([gr, gc]) => gr === r && gc === c));
    clearedBoard[r][c] = { ...mk(type, special, undefined, g?.dir), clearing: false };
  });

  // gravity + refill
  const after: Board = clearedBoard.map((row) => row.map((t) => (t && t.clearing ? null : t ? { ...t } : null)));
  for (let c = 0; c < SIZE; c++) {
    const col: Tile[] = [];
    for (let r = SIZE - 1; r >= 0; r--) if (after[r][c]) col.push(after[r][c]!);
    const missing = SIZE - col.length;
    for (let r = SIZE - 1; r >= 0; r--) {
      const idx = SIZE - 1 - r;
      if (idx < col.length) after[r][c] = { ...col[idx], fresh: undefined };
      else after[r][c] = mk(randType(), 0, missing);
    }
  }
  return {
    clearedBoard, afterBoard: after, cleared,
    groups: groups.map((g) => ({ type: g.type, size: g.size, dir: g.dir })),
    activated, created, perType, collateral,
  };
}

/** Turn n random normal tiles into `type` (used by the Guitarist's ultimate). Returns changed board. */
export function convertTiles(b: Board, n: number, type: number, specials = 0): Board {
  const nb = cloneBoard(b);
  const cells: Pos[] = [];
  nb.forEach((row, r) => row.forEach((t, c) => { if (t && !t.special && t.type !== type) cells.push([r, c]); }));
  for (let i = 0; i < n && cells.length; i++) {
    const [r, c] = cells.splice(rnd(cells.length), 1)[0];
    nb[r][c] = mk(type, i < specials ? 1 : 0, undefined, Math.random() < 0.5 ? 'h' : 'v');
  }
  return nb;
}
