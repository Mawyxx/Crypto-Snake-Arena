# Как сделать визуал как в Slither.io

Сравнение Slither.io (game_deobfuscated.js) и Crypto Snake Arena (frontend). Что уже есть и что нужно доделать.

---

## 1. Фон арены

### Slither.io
- **bg54.jpg** — текстура с гексагональным паттерном (599×519 px)
- URL: `http://slither.io/s/bg54.jpg`
- Рисуется как `createPattern` с тайлингом
- Цвет фона под текстурой: `#000000`
- Параллакс: `bgx2`, `bgy2` смещаются при движении камеры

### Crypto Snake Arena (сейчас)
- Процедурная шестиугольная сетка в `ArenaBackground`
- Цвет hex: `0x161c22`, границы `0x1a2332`
- Внутренний rect: `0x0f1419`

### Что сделать
1. **Вариант A**: Скачать `bg54.jpg` и использовать как tiled texture (PixiJS TilingSprite)
2. **Вариант B**: Оставить процедурную сетку, но подогнать цвета под Slither:
   - Фон: `#161c22` (как в STYLE_REFERENCE)
   - Гексы: чуть светлее, как в bg54 (тёмно-синий/серый)
3. Добавить параллакс фона при движении камеры (смещение на ~1% от viewport)

---

## 2. Змея (SnakeView)

### Slither.io
- **Два режима рендера**:
  - **render_mode 1**: линия (quadraticCurveTo) + stroke, без кругов
  - **render_mode 2**: круги по сегментам (как у нас)
- **lsz** = `29 * scale` (scale 1..6)
- **Обводка**: чёрная `#000000`, lineWidth = `(lsz + 5) * gameScale`
- **Boost glow**: `shadowBlur = 30 * gameScale`, `shadowColor = rgba(r,g,b, alpha)`
- **Голова**: olsz = `lsz * 52/32`, shsz = `lsz * 62/32` (больше тела)
- **Swell**: первые 4 сегмента от головы — радиус `1 + (4-i)*0.08`
- **Смерть**: `strokeStyle = "#FFCC99"`, пульсирующая alpha

### Crypto Snake Arena (сейчас)
- Круги по сегментам ✓
- lsz = 29 * scale ✓
- Обводка (lsz+5) ✓
- Boost glow ✓
- Swell для первых 4 ✓
- Голова 62/32 ✓

### Что доработать
1. **Тень при boost**: в Slither `ctx.shadowBlur = 30 * gameScale` — в PixiJS можно `graphics.filters` или отрисовывать дополнительный слой с blur
2. **Alpha обводки**: Slither использует `globalAlpha = 0.4` для чёрной обводки (полупрозрачная)
3. **Режим линии**: если хочется 1:1 — можно добавить режим с `quadraticCurveTo` вместо кругов (как render_mode 1 в Slither)

---

## 3. Еда / монеты (CoinView)

### Slither.io
- **Два слоя**: ofi (outline) + fi (glow) с `globalCompositeOperation = "lighter"` (ADD)
- **Пульсация**: `alpha = (.5 + .5 * Math.cos(gfr/13)) * frameCounter`
- **Размер**: rad = sz/5, текстуры масштабируются
- **Цвета**: из палитры rrs/ggs/bbs по cv (0..8)

### Crypto Snake Arena (сейчас)
- Простые круги с glow (3 слоя: +10, +5, core)
- Блик для объёма ✓
- Цвета из ORB_COLORS ✓

### Что сделать
1. **Пульсация**: добавить `alpha *= 0.5 + 0.5 * Math.cos(time/13)` для «дыхания» орба
2. **ADD blend**: в PixiJS — `graphics.blendMode = BLEND_MODES.ADD` для glow-слоёв
3. **Размер**: привязать к value как сейчас (4 + value*0.2) — ок

---

## 4. Цвета и палитра

### Slither.io (первые 9)
| # | Hex     |
|---|---------|
| 0 | #c080ff |
| 1 | #9099ff |
| 2 | #80d0d0 |
| 3 | #80ff80 |
| 4 | #eeee70 |
| 5 | #ffa060 |
| 6 | #ff9090 |
| 7 | #ff4040 |
| 8 | #e030e0 |

### Crypto Snake Arena
- SNAKE_COLORS и ORB_COLORS уже совпадают ✓

---

## 5. Глаза змеи

### Slither.io
- `ed = 6 * scale`, `esp = 6 * scale` (расстояние, размер)
- Белый белок, чёрный зрачок
- Один глаз (one_eye) или два

### Crypto Snake Arena
- `eyeDist = 6 * scale`, `eyeR = 2.8 * scale` ✓
- Блик на зрачке ✓

---

## 6. Никнейм / счёт

### Slither.io
- Ник над змеёй: `nty + 32 + 11 * scale * gameScale`
- Шрифт: 15px Arial
- Цвет: `csw` (светлая версия цвета змеи)
- Alpha: `0.5 * na * alive_amt * (1 - dead_amt)`

### Crypto Snake Arena
- Счёт под змеёй (x+14, y+10)
- 16px Arial bold, белый с тенью ✓

---

## 7. Масштаб и камера

### Slither.io
- `gameScale` динамический: `0.64 + 0.51 / max(1, (sct+16)/36)`
- Арена: `arenaSize = 16384`, `SegmentLen = 42`
- Камера следует за головой с интерполяцией

### Crypto Snake Arena
- `WORLD_SIZE = 2000`, `ARENA_RADIUS = 1000`
- `CAMERA_ZOOM = 0.8`
- SegmentLen 42 → при 2000 мире масштаб ок

---

## 8. Чек-лист изменений

| Компонент      | Действие |
|----------------|----------|
| ArenaBackground | Загрузить bg54.jpg как TilingSprite ИЛИ подогнать цвета hex под #161c22 |
| ArenaBackground | Параллакс при движении камеры |
| SnakeView      | Boost: добавить blur/glow как shadowBlur 30 |
| SnakeView      | Обводка: alpha 0.4 для чёрного контура |
| CoinView       | Пульсация alpha: `0.5 + 0.5*cos(t/13)` |
| CoinView       | `blendMode = ADD` для glow-слоёв |
| Общее          | Фон Stage: `#161c22` ✓ (уже есть) |

---

## 9. Быстрые правки (приоритет)

1. **CoinView** — пульсация и ADD blend (2 правки)
2. **ArenaBackground** — использовать bg54.jpg или улучшить hex-сетку
3. **SnakeView** — blur при boost (если PixiJS поддерживает)
