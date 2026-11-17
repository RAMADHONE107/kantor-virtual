// Grid-based navigation for office characters: keeps them inside the room and
// outside desks/facilities. Pure module so paths can be verified without a DOM.

export function createNavigator({ minX, maxX, minZ, maxZ, cell = 0.6, obstacles = [] }) {
  const cols = Math.ceil((maxX - minX) / cell);
  const rows = Math.ceil((maxZ - minZ) / cell);
  const blocked = new Uint8Array(cols * rows);
  const idx = (i, j) => j * cols + i;
  const inside = (i, j) => i >= 0 && j >= 0 && i < cols && j < rows;
  const world = (i, j) => ({ x: minX + (i + 0.5) * cell, z: minZ + (j + 0.5) * cell });
  const cellOf = (x, z) => ({
    i: Math.floor((x - minX) / cell),
    j: Math.floor((z - minZ) / cell),
  });

  function markRect(x1, z1, x2, z2) {
    const lo = cellOf(Math.min(x1, x2), Math.min(z1, z2));
    const hi = cellOf(Math.max(x1, x2), Math.max(z1, z2));
    for (let j = lo.j; j <= hi.j; j++) {
      for (let i = lo.i; i <= hi.i; i++) {
        if (inside(i, j)) blocked[idx(i, j)] = 1;
      }
    }
  }

  function markCircle(x, z, r) {
    const lo = cellOf(x - r, z - r);
    const hi = cellOf(x + r, z + r);
    for (let j = lo.j; j <= hi.j; j++) {
      for (let i = lo.i; i <= hi.i; i++) {
        const p = world(i, j);
        if (inside(i, j) && Math.hypot(p.x - x, p.z - z) <= r) blocked[idx(i, j)] = 1;
      }
    }
  }

  obstacles.forEach((o) => {
    if (o.type === 'circle') markCircle(o.x, o.z, o.r);
    else markRect(o.x1, o.z1, o.x2, o.z2);
  });

  const free = (i, j) => inside(i, j) && !blocked[idx(i, j)];

  function nearestFree(x, z) {
    const { i, j } = cellOf(x, z);
    if (free(i, j)) return { i, j };
    for (let r = 1; r <= 10; r++) {
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          if (Math.abs(di) !== r && Math.abs(dj) !== r) continue;
          if (free(i + di, j + dj)) return { i: i + di, j: j + dj };
        }
      }
    }
    return null;
  }

  function lineClear(a, b) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (cell * 0.4)));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const c = cellOf(a.x + dx * t, a.z + dz * t);
      if (!free(c.i, c.j)) return false;
    }
    return true;
  }

  const heuristic = (a, b) => Math.hypot(a.i - b.i, a.j - b.j);

  function findPath(from, to) {
    const startCell = nearestFree(from.x, from.z);
    const goalCell = nearestFree(to.x, to.z);
    if (!startCell || !goalCell) return [];

    const start = idx(startCell.i, startCell.j);
    const goal = idx(goalCell.i, goalCell.j);
    const gScore = new Float64Array(cols * rows).fill(Infinity);
    const fScore = new Float64Array(cols * rows).fill(Infinity);
    const cameFrom = new Int32Array(cols * rows).fill(-1);
    const open = [start];
    const inOpen = new Set([start]);
    gScore[start] = 0;
    fScore[start] = heuristic(startCell, goalCell);

    while (open.length) {
      let best = 0;
      for (let k = 1; k < open.length; k++) {
        if (fScore[open[k]] < fScore[open[best]]) best = k;
      }
      const current = open.splice(best, 1)[0];
      inOpen.delete(current);

      if (current === goal) {
        const cells = [];
        for (let at = current; at !== -1; at = cameFrom[at]) cells.push(at);
        cells.reverse();
        const points = cells.map((n) => world(n % cols, Math.floor(n / cols)));
        // End on the free goal cell, never on the raw target which may sit
        // inside a desk/chair obstacle (that is what caused clipping).
        points.push(world(goalCell.i, goalCell.j));

        const smoothed = [];
        let i = 0;
        while (i < points.length - 1) {
          let j = points.length - 1;
          while (j > i + 1 && !lineClear(points[i], points[j])) j--;
          smoothed.push(points[j]);
          i = j;
        }
        return smoothed;
      }

      const ci = current % cols;
      const cj = Math.floor(current / cols);
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const ni = ci + di;
          const nj = cj + dj;
          if (!free(ni, nj)) continue;
          if (di && dj && (!free(ci + di, cj) || !free(ci, cj + dj))) continue;
          const next = idx(ni, nj);
          const cost = gScore[current] + (di && dj ? Math.SQRT2 : 1);
          if (cost < gScore[next]) {
            cameFrom[next] = current;
            gScore[next] = cost;
            fScore[next] = cost + heuristic({ i: ni, j: nj }, goalCell);
            if (!inOpen.has(next)) {
              open.push(next);
              inOpen.add(next);
            }
          }
        }
      }
    }
    return [];
  }

  return { findPath, lineClear, free, cellOf, world };
}
