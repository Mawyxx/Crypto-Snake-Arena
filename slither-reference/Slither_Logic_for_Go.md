# Slither Logic for Go — Reference Report

Reverse-engineered from [slither-reference/game.js](game.js). Use this document when implementing the Go backend for Crypto Snake Arena.

---

## 1. Variable Mapping (Deobfuscation)

Run `deobfuscate.py` to produce `var_mapping.json`. Key mappings:

| Obfuscated | Human-readable |
|------------|----------------|
| oef | gameLoop |
| o.xx, o.yy | headX, headY |
| o.ang | currentAngle |
| o.eang | targetAngle / mouseAngle |
| o.wang | serverAngle |
| o.sp | speed |
| o.pts | bodyPoints (tail segments) |
| o.msl | segmentLength (default_msl) |
| vfr | frameDelta (time/8) |
| mamu | turnRatePerFrame |
| spangdv | speedForFullTurn |
| cst | bodySmoothingConst |
| smus | separationMultipliers |
| nsp1, nsp2, nsp3 | baseSpeed, speedPerScale, boostSpeed |
| eez | interpolationFrames (53) |
| nsep | minSegmentSpacing |
| grd | arenaSize (16384) |

---

## 2. Physics Analysis (Game Loop `oef`)

**Source:** game.js lines 205–244, 233–236, 386–391

### Movement Math

```
vfr = (ctm - ltm) / 8                    // frame delta, capped 0..5, then * lag_mult
csp = o.sp * vfr / 4                     // distance this frame (clamped to msl)
o.xx += cos(o.ang) * csp
o.yy += sin(o.ang) * csp
```

### Turn (mamu, spang, scang)

```
mang = mamu * vfr * o.scang * o.spang
o.spang = min(1, o.sp / spangdv)
// scang = 0.13 + 0.87 * ((7 - scale) / 6)^2  (scale 1..6)
// ang lerps toward eang by mang
```

### Constants

| Constant | Value | Meaning |
|----------|-------|---------|
| nsp1 | 4.25 | Base speed |
| nsp2 | 0.5 | Speed per scale |
| nsp3 | 12 | Boost speed |
| spangdv | 4.8 | Speed for full turn |
| mamu | 0.033 | Turn rate per frame |
| mamu2 | 0.028 | Prey turn rate |
| cst | 0.43 | Body smoothing constant |
| default_msl | 42 | Segment length (world units) |
| eez | 53 | Interpolation frames (lfc, rfc, hfc) |

**Tick rate:** vfr in “eighths” of ms → ~125 Hz base.

**Conversion to units/sec (dt=0.05):**
- Base: `csp = sp * vfr/4`, vfr≈1 per frame → csp = sp/4 per frame.
- At 20 fps: sp=4.75 → 4.75/4*20 ≈ 23.75 units/sec.
- If ctm-ltm≈40ms, vfr=5, so csp=4.75*5/4≈6 units per frame → ~120 units/sec at 20fps.

---

## 3. Tail / Body Logic

**Server-driven:** Server sends new points via `g`/`G`/`n`/`N`/`+`/`=`. Client does NOT run Verlet locally for other snakes — it interpolates received positions.

### Point structure (per segment)

| Field | Meaning |
|-------|---------|
| xx, yy | Position |
| fx, fy | Interpolation offset |
| smu | Separation mult (from smus) |
| ltn | Length ratio |
| fltn, da | Interpolation state |

### Smus (recalcSepMults)

```javascript
smus[i] = 1           // i < 3 (tail tip)
smus[i] = 1 - cst*n/4 // n=1..4: 0.8925, 0.785, 0.6775, 0.57
smus[i] = 0.57        // n > 4
```

### On new point (line 386)

```javascript
for (m = k-1; m >= 0; m--) {
  n++; mv = (n<=4) ? cst*n/4 : cst;
  mpo.xx += (lmpo.xx - mpo.xx) * mv;
  mpo.yy += (lmpo.yy - mpo.yy) * mv;
  lmpo = mpo;
}
```

**Interpolation buffers:** `lfc=rfc=hfc=eez=53` frames for smooth position/angle.

---

## 4. Protocol Analysis (ws.onmessage / ws.send)

**Source:** game.js ~lines 365–450, 69, 224–232

### Outgoing (Client → Server)

| First byte(s) | ID | Function |
|---------------|-----|----------|
| 101 (legacy) / 0–255 (v5) | Angle | Mouse direction (1 byte = 256 steps) |
| 108 / 252+0–127 | Turn left | Key turn |
| 114 / 252+128–255 | Turn right | Key turn |
| 109 / 253–254 | Boost | Accel on/off |
| 112 / 251 | Ping | Keepalive |
| 115 / 111 | Login | Nickname + skin |
| 118 / 255+118 | Victory | Victory message |

**Angle (protocol v5):** `sang = floor(251 * ang / 2π)`, 1 byte.

**Coordinates:** Server sends; client does not send position.

### Incoming (Server → Client)

| cmd | Function |
|-----|----------|
| s | Spawn snake (full state) |
| e, E, 3, 4, 5, d, 7 | Movement update (dir, ang, wang, speed) |
| g, G, n, N, +, = | Add/move point (body growth) |
| c, C, < | Food eaten |
| b, f | Food spawn |
| F | Food batch |
| r | Remove segment (death) |
| R | Respawn count |
| h | Length update |
| l | Leaderboard |
| v | Death / victory |
| p | Pong |
| w, W | Sector update |
| U, L, M, V, u | Minimap |
| i, o | Admin / teams |
| 6 | Server version |

### Packet structures (key messages)

**Snake spawn (s):** id(2), ang(3), dir(1), wang(3), speed(2), fam(3), cv(1), head(3+3), nickLen(1), nick, [skinLen, skin], [cosmetic]. Coords: `(x<<16|y<<16)/5` or delta bytes.

**Movement (e/E/…):** id(2), [ang(1 or 2)], [wang(1 or 2)], [speed(1)]. Angle: 1 byte = 2π/256.

**New point (g/n/…):** [id(2)], [iang(2)], xx(2), yy(2), [fam(3)]. Coords: 16-bit or delta from prev.

**Food (b/f):** id, [sector], xx, yy, rad(=sz/5).

---

## 5. Collision Constants

**Source:** game.js lines 94–95, 142, 279

| Constant | Value | Meaning |
|----------|-------|---------|
| eez | 53 | Interpolation frames (lfc, rfc, hfc) |
| nsep | 4.5 (3 if ggl) | Min segment spacing for rendering |
| default_msl | 42 | Segment length (world units) |
| fo.sz | rad from server | Food size (rad = a[m]/5) |
| wsep | 6 * o.sc | Body width factor |
| lsz | ~6 * sc (visual) | Line width for drawing |

**Collision (server-side, inferred from client):**
- **Food eat:** `distance(head, food) < headRadius + foodRadius`. Head radius ~ half body width. In Slither units: head ~ 6–10, food sz ~ 3–16 (rad*5). Use: **headRadius ≈ 6**, **foodEatRadius = headRadius + foodSize**.
- **Snake-vs-snake:** Head vs body segments. Segment radius ~ `msl/4` to `msl/3` (narrow phase). Use: **SnakeRadius ≈ 10–12**.

**Recommended for Go:**

```go
const (
    SegmentLen   = 42.0
    SnakeRadius  = 10.0   // head/body collision
    CoinRadius   = 8.0    // food eat distance (or headRadius + foodSize)
)
```

---

## 6. Data Structures for Go

### Snake (physics)

```go
type SnakeState struct {
    HeadX, HeadY float64
    Angle        float64  // current
    TargetAngle  float64  // from client
    Speed        float64  // nsp1+nsp2*scale or nsp3
    SegmentLen   float64
    Tail         []Point  // [x,y, x,y, ...]
    Boost        bool
}
```

### Point (segment)

```go
type Segment struct {
    X, Y float64
    // Optional: Fx, Fy for interpolation
}
```

### Message IDs (for broadcast)

```go
const (
    MsgSpawn   = 's'
    MsgMove    = 'e'
    MsgGrow    = 'g'
    MsgEat     = 'c'
    MsgDeath   = 'r'
    MsgPong    = 'p'
)
```

---

## 7. File Layout

```
slither-reference/
├── game.js              # existing
├── index.html           # existing
├── deobfuscate.py       # scanner + mapping
├── var_mapping.json     # output of script
├── Slither_Logic_for_Go.md  # this report
└── STYLE_REFERENCE.md   # existing
```

---

## 8. Scale / Turn Formula (scang)

```go
// scale 1..6
scang := 0.13 + 0.87*math.Pow((7-scale)/6, 2)
```

---

## 9. Speed Formula

```go
// Base speed
ssp := nsp1 + nsp2*scale  // 4.25 + 0.5*scale
// Boost
msp := nsp3               // 12
// spang for turn rate
spang := math.Min(1, speed/spangdv)
```
