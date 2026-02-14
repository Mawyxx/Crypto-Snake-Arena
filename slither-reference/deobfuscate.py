#!/usr/bin/env python3
"""
Slither.io game.js deobfuscation script.
Scans JS files and builds a mapping of obfuscated variable names to human-readable ones.
Output: var_mapping.json, game_deobfuscated.js (formatted + deobfuscated)
"""

import json
import re
import sys
from pathlib import Path

# Hardcoded mappings from manual reverse-engineering analysis (expanded)
KNOWN_MAPPINGS = {
    # Game loop & timing
    "oef": "gameLoop",
    "vfr": "frameDelta",
    "avfr": "actualFrameDelta",
    "vfrb": "frameDeltaInt",
    "fr": "frameCounter",
    "lfr": "lastFrameCounter",
    "ltm": "lastTime",
    "ctm": "currentTime",
    "etm": "elapsedTime",
    "pi2": "TWO_PI",
    "a64k": "RAD_TO_FIXED_POINT",
    "k64a": "FIXED_POINT_TO_RAD",
    # Snake object (o.*)
    "o.xx": "headX",
    "o.yy": "headY",
    "o.ang": "currentAngle",
    "o.eang": "targetAngle",
    "o.wang": "serverAngle",
    "o.sp": "speed",
    "o.tsp": "targetSpeed",
    "o.pts": "bodyPoints",
    "o.msl": "segmentLength",
    "o.sct": "segmentCount",
    "o.sc": "scale",
    "o.scang": "scaleAngleFactor",
    "o.spang": "speedAngleFactor",
    "o.fx": "interpOffsetX",
    "o.fy": "interpOffsetY",
    "o.fa": "interpAngle",
    "o.fx": "interpOffsetX",
    "o.fy": "interpOffsetY",
    "o.fchl": "interpLength",
    "o.chl": "chainLength",
    "o.smu": "separationMult",
    "o.fsmu": "interpSeparationMult",
    "o.fam": "fractionalLength",
    "o.sfr": "smoothFrame",
    "o.wsep": "widthSeparation",
    "o.sep": "separation",
    "o.dir": "direction",
    "o.dead": "isDead",
    "o.ehang": "eyeAngle",
    "o.wehang": "targetEyeAngle",
    "o.ehl": "eyeLength",
    "o.md": "mouseDown",
    "o.wmd": "wantMouseDown",
    "o.gptz": "gpuPoints",
    # Point/segment (po.*)
    "po.xx": "segmentX",
    "po.yy": "segmentY",
    "po.fx": "segmentInterpX",
    "po.fy": "segmentInterpY",
    "po.smu": "segmentSmu",
    "po.ltn": "segmentLengthRatio",
    "po.fltn": "segmentFltn",
    "po.da": "segmentDa",
    "po.dying": "segmentDying",
    "po.iang": "segmentInitialAngle",
    "po.ebx": "segmentEbx",
    "po.eby": "segmentEby",
    # Physics constants
    "spangdv": "speedForFullTurn",
    "mamu": "turnRatePerFrame",
    "mamu2": "turnRatePerFrame2",
    "cst": "bodySmoothingConst",
    "nsp1": "baseSpeed",
    "nsp2": "speedPerScale",
    "nsp3": "boostSpeed",
    "default_msl": "defaultSegmentLength",
    "eez": "interpolationFrames",
    "nsep": "minSegmentSpacing",
    "smuc": "smusCount",
    "smuc_m3": "smusCountMinus3",
    "smus": "separationMultipliers",
    # Arena & world
    "grd": "arenaSize",
    "flux_grd": "fluxGradient",
    "real_flux_grd": "realFluxGradient",
    "sector_size": "sectorSize",
    "ssd256": "sectorSizeDiv256",
    # Food
    "fo.xx": "foodX",
    "fo.yy": "foodY",
    "fo.rx": "foodRenderX",
    "fo.ry": "foodRenderY",
    "fo.sz": "foodSize",
    "fo.rad": "foodRadius",
    "fo.eaten": "foodEaten",
    "fo.eaten_by": "foodEatenBy",
    "fo.eaten_fr": "foodEatenFrame",
    # Protocol
    "protocol_version": "protocolVersion",
    "ws": "webSocket",
    "slither": "playerSnake",
    "slithers": "allSnakes",
    "foods": "allFoods",
    "foods_c": "foodsCount",
    "os": "snakesById",
    # View
    "view_xx": "viewX",
    "view_yy": "viewY",
    "view_ang": "viewAngle",
    "view_dist": "viewDistance",
    "gsc": "gameScale",
    "mww": "canvasWidth",
    "mhh": "canvasHeight",
    "mww2": "canvasWidthHalf",
    "mhh2": "canvasHeightHalf",
    # Misc
    "lfas": "leftInterpFactors",
    "rfas": "rightInterpFactors",
    "hfas": "headInterpFactors",
    "afas": "angleInterpFactors",
    "lfc": "leftFrameCount",
    "rfc": "rightFrameCount",
    "hfc": "headFrameCount",
    "afc": "angleFrameCount",
    "lmpo": "lastMovedPoint",
    "mpo": "movedPoint",
    "lpo": "lastPoint",
    # UI / DOM
    "ggl": "useWebGL",
    "trf": "setTransform",
    "trfo": "setTransformOrigin",
    "mos": "mouseOverStates",
    "whmos": "wantHoverMouseOverState",
    "swmup": "setWindowMouseUp",
    "ois": "loadingImages",
    "wic": "waitingImageCount",
    "ldi": "loadImage",
    "tsh": "textShadowStyles",
    "agpu": "gpuTransform",
    # Servers / network
    "sos": "serverList",
    "clus": "clusters",
    "bso": "bestServer",
    "bcluo": "bestCluster",
    "bcptm": "bestClusterPingTime",
    "fbso": "forcedBestServer",
    "fobso": "forcedBestServerObj",
    # Game state
    "playing": "isPlaying",
    "connected": "isConnected",
    "connecting": "isConnecting",
    "want_play": "wantPlay",
    "want_close_socket": "wantCloseSocket",
    "waiting_for_sos": "waitingForServers",
    "sos_ready_after_mtm": "serversReadyAfterTime",
    "sos_loaded_at_mtm": "serversLoadedAtTime",
    "start_connect_mtm": "startConnectTime",
    "play_btn_click_mtm": "playBtnClickTime",
    "dead_mtm": "deadTime",
    "last_ping_mtm": "lastPingTime",
    "lpstm": "lastPingSendTime",
    "cptm": "currentPingTime",
    "lptm": "lastPingTime",
    "want_etm_s": "wantElapsedTimeSync",
    "want_seq": "wantSequence",
    "lseq": "lastSequence",
    "wfpr": "waitingForPong",
    "lagging": "isLagging",
    "lag_mult": "lagMultiplier",
    # Prey / food
    "preys": "allPreys",
    "points_dp": "pointsDeadpool",
    "food_dp": "foodDeadpool",
    "prey_dp": "preyDeadpool",
    "slither_dp": "slitherDeadpool",
    "name_dp": "nameDeadpool",
    # Keys
    "kd_l": "keyDownLeft",
    "kd_r": "keyDownRight",
    "kd_u": "keyDownUp",
    "kd_l_frb": "keyDownLeftFrames",
    "kd_r_frb": "keyDownRightFrames",
    "lkstm": "lastKeySendTime",
    # UI elements
    "lbh": "leaderboardHeader",
    "lbs": "leaderboardScores",
    "lbn": "leaderboardNames",
    "lbp": "leaderboardPositions",
    "lbf": "leaderboardFooter",
    "lb_fr": "leaderboardFade",
    "vcm": "victoryMessage",
    "loch": "locationHolder",
    "asmc": "arenaMinimapCanvas",
    "asmc2": "arenaMinimapCanvas2",
    "myloc": "myLocationMarker",
    "sbmc": "scoreboardMinimap",
    "play_btn": "playButton",
    "save_btn": "saveButton",
    "nick": "nicknameInput",
    "victory": "victoryInput",
    "victory_holder": "victoryHolder",
    "saveh": "saveHolder",
    "playh": "playHolder",
    "smh": "skinMenuHolder",
    "cskh": "cosmeticSkinHolder",
    "csrvh": "cosmeticServerHolder",
    "pskh": "prevSkinHolder",
    "nskh": "nextSkinHolder",
    "bskh": "buildSkinHolder",
    "scosh": "selectCosmeticHolder",
    "skodiv": "skinOptionsDiv",
    "revdiv": "revertDiv",
    "etcoh": "enterCodeHolder",
    "grqh": "graphicsQualityHolder",
    "plq": "playQuality",
    "clq": "closeQuality",
    "grq": "graphicsQuality",
    "login": "loginElement",
    "login_fr": "loginFade",
    "login_iv": "loginInterval",
    "llgmtm": "lastLoginGmtTime",
    "mc": "mainCanvas",
    "tips": "tipsElement",
    "tip_fr": "tipFade",
    "tip_pos": "tipPosition",
    "tipss": "tipsStrings",
    "ldmc": "loadingMinimapCanvas",
    "lsfr": "loadingSpinnerFrame",
    "lcldtm": "lastCanvasLoadTime",
    "ss_a": "startShowAlpha",
    "ss_sh": "startShowScale",
    "spinner_shown": "spinnerShown",
    "entering_code": "enteringCode",
    "ending_enter_code": "endingEnterCode",
    "checking_code": "checkingCode",
    "building_skin": "buildingSkin",
    "ending_build_skin": "endingBuildSkin",
    "selecting_cosmetic": "selectingCosmetic",
    "ending_select_cosmetic": "endingSelectCosmetic",
    "choosing_skin": "choosingSkin",
    "bdska": "buildSkinAlpha",
    "secosa": "selectCosmeticAlpha",
    "skoboym": "skinOptionsYOffset",
    "secosoym": "selectCosmeticYOffset",
    "build_segments": "buildSegments",
    "bskbtns": "buildSkinButtons",
    "cosbtns": "cosmeticButtons",
    "want_open_cosmetics": "wantOpenCosmetics",
    "want_victory_message": "wantVictoryMessage",
    "want_victory_focus": "wantVictoryFocus",
    "want_hide_victory": "wantHideVictory",
    "hvfr": "hideVictoryFade",
    "victory_bg": "victoryBackground",
    "lastscore": "lastScoreElement",
    "nick_holder": "nicknameHolder",
    "shoa": "showAd",
    "wumsts": "wantUpdateLeaderboard",
    # Misc
    "timeObj": "timeObject",
    "no_raf": "noRequestAnimationFrame",
    "raf": "requestAnimationFrame",
    "animating": "isAnimating",
    "adm": "isAdmin",
    "my_nick": "myNickname",
    "lsang": "lastSentAngle",
    "want_e": "wantSendAngle",
    "last_e_mtm": "lastAngleSendTime",
    "last_accel_mtm": "lastAccelSendTime",
    "locu_mtm": "locationUpdateTime",
    "lrd_mtm": "lastStatsResetTime",
    "mmal": "minimapAlpha",
    "mmgad": "minimapGotData",
    "mmbfr": "minimapBlendFrame",
    "mmsta": "minimapState",
    "mmrad": "minimapRadius",
    "mmsz": "minimapSize",
    "mmdata": "minimapData",
    "tsbal": "teamScoreboardAlpha",
    "tsbgad": "teamScoreboardGotData",
    "tsbgad_stm": "teamScoreboardGotDataTime",
    "team1_score": "team1Score",
    "team2_score": "team2Score",
    "team1_vsc": "team1VisibleScore",
    "team2_vsc": "team2VisibleScore",
    "team1_eo": "team1EaseOut",
    "team2_eo": "team2EaseOut",
    "team1_scores": "team1Scores",
    "team2_scores": "team2Scores",
    "team_score_pos": "teamScorePosition",
    "trump_loaded": "trumpLoaded",
    "kamala_loaded": "kamalaLoaded",
    "trump_a": "trumpAlpha",
    "kamala_a": "kamalaAlpha",
    "trump_ii": "trumpImage",
    "kamala_ii": "kamalaImage",
    "team1_bar": "team1Bar",
    "team2_bar": "team2Bar",
    "team1_pct": "team1Percent",
    "team2_pct": "team2Percent",
    "teams_disabled": "teamsDisabled",
    "teams_exist": "teamsExist",
    "tsbofx": "teamScoreboardOffsetX",
    "tsbofy": "teamScoreboardOffsetY",
    "sectors": "sectorList",
    "sgsdr": "segmentsDrawn",
    "fdsdr": "foodsDrawn",
    "fps": "framesPerSecond",
    "apkps": "avgPacketsPerSecond",
    "pkps": "packetsPerSecond",
    "rdps": "bytesPerSecond",
    "tapkps": "totalAvgPackets",
    "tpkps": "totalPackets",
    "high_quality": "highQuality",
    "gla": "graphicsLevelAlpha",
    "wdfg": "wantDecreaseGraphicsFrames",
    "qsm": "qualityScaleMult",
    "mqsm": "maxQualityScaleMult",
    "gsc": "gameScale",
    "sgsc": "baseGameScale",
    "lgbsc": "loginBaseScale",
    "lgcsc": "loginCurrentScale",
    "drez": "dragonEyes",
    "pr": "prey",
    "xm": "mouseX",
    "ym": "mouseY",
    "lsxm": "lastSentMouseX",
    "lsym": "lastSentMouseY",
    "fvx": "followViewX",
    "fvy": "followViewY",
    "fvtg": "followViewTarget",
    "fvpos": "followViewPos",
    "fvxs": "followViewXs",
    "fvys": "followViewYs",
    "vfas": "viewFadeFactors",
    "vfc": "viewFrameCount",
    "ovxx": "oldViewX",
    "ovyy": "oldViewY",
    "bpx1": "boundsMinX",
    "bpy1": "boundsMinY",
    "bpx2": "boundsMaxX",
    "bpy2": "boundsMaxY",
    "fpx1": "foodBoundsMinX",
    "fpy1": "foodBoundsMinY",
    "fpx2": "foodBoundsMaxX",
    "fpy2": "foodBoundsMaxY",
    "apx1": "allBoundsMinX",
    "apy1": "allBoundsMinY",
    "apx2": "allBoundsMaxX",
    "apy2": "allBoundsMaxY",
    "iiv": "isInView",
    "flxc": "fluxCount",
    "flxas": "fluxFactors",
    "flx_tg": "fluxTarget",
    "flux_grds": "fluxGradients",
    "flux_grd_pos": "fluxGradientPos",
    "recalcSepMults": "recalcSeparationMultipliers",
    "recalcPtms": "recalcPingTimes",
    "recalcTainted": "recalcTaintedServers",
    "setMscps": "setMaxSegmentCountPerSnake",
    "mscps": "maxSegmentCountPerSnake",
    "fmlts": "fractionalLengthMultipliers",
    "fpsls": "fpsLengthScores",
    "snl": "snakeLength",
    "gdnm": "isValidNickname",
    "flt_a": "filterA",
    "flt_g": "filterG",
    "flt_w": "filterW",
    "newSlither": "createSnake",
    "newFood": "createFood",
    "newPrey": "createPrey",
    "destroySlitherAtIndex": "deleteSnakeAtIndex",
    "destroyFood": "deleteFood",
    "destroyPrey": "deletePrey",
    "resetGame": "resetGameState",
    "connect": "connectToServer",
    "redraw": "redrawFrame",
    "gotPacket": "handlePacket",
    "gotServerVersion": "handleServerVersion",
    "startLogin": "sendLogin",
    "setSkin": "applySkin",
    "getBuildSkinData": "getBuildSkinData",
    "addCss": "addCssStyles",
    "gneo": "createEaseOut",
    "pwr": "powerArray",
    "pca": "powerComplementArray",
    "setMinimapSize": "setMinimapSize",
    "startShowGame": "startShowGame",
    "loginFade": "loginFadeAnimation",
    "heystup": "heyStupidCheck",
    "forceOnce": "forceServerOnce",
    "mkBtn": "makeButton",
    "hmos": "handleMouseOverState",
    "makeTextBtn": "makeTextButton",
    "newDeadpool": "createDeadpool",
    "asciize": "asciiOnly",
    "arp": "addOrGetGpuPoint",
}


def scan_js_vars(js_content: str) -> dict[str, str]:
    """Extract variable names from JS using regex patterns."""
    found = {}
    # Var declarations: var x=, var xy=, etc.
    for m in re.finditer(r"\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=", js_content):
        found[m.group(1)] = True
    # Object property patterns (o.xx, etc.) - we use known mappings
    for m in re.finditer(r"\b([a-z][a-zA-Z0-9_]*\.[a-zA-Z0-9_]+)\b", js_content):
        key = m.group(1)
        if key in KNOWN_MAPPINGS and key not in found:
            found[key] = True
    return found


def build_mapping(js_content: str) -> dict[str, str]:
    """Build full mapping: obfuscated -> human-readable."""
    mapping = {}
    for obf, human in KNOWN_MAPPINGS.items():
        if obf in js_content or obf.replace(".", r"\.") in js_content:
            mapping[obf] = human
    # Add any scanned vars that have known mappings
    scanned = scan_js_vars(js_content)
    for var in scanned:
        if var in KNOWN_MAPPINGS:
            mapping[var] = KNOWN_MAPPINGS[var]
    return dict(sorted(mapping.items()))


# Skip these identifiers - appear in strings (e.g. "mac os x")
SIMPLE_ID_BLACKLIST = {"os"}

# IDs that appear in strings (URLs, getElementById) - use string-aware replace
STRING_CONTEXT_IDS = {
    "slither", "grq", "grqh", "grqi", "phqi", "nick", "victory", "victory_bg", "logo", "login",
    "lastscore", "nick_holder", "victory_holder", "playh", "tips", "saveh", "smh", "csk", "cskh",
    "bsk", "bskh", "scos", "scosh", "etco", "etcoh", "csrv", "csrvh", "plq", "clq", "psk", "pskh",
    "nsk", "nskh", "etcod", "ocho", "trumpbtn", "trumpbtnh", "votetxth", "kamalabtn", "kamalabtnh",
}


def _get_string_ranges(text: str) -> list[tuple[int, int]]:
    """Return list of (start, end) ranges that are inside string literals."""
    ranges = []
    i = 0
    in_str = None
    str_start = 0
    escape = False
    while i < len(text):
        if escape:
            escape = False
            i += 1
            continue
        if in_str:
            if text[i] == in_str:
                ranges.append((str_start, i + 1))
                in_str = None
            i += 1
            continue
        if text[i] in ('"', "'", "`"):
            in_str = text[i]
            str_start = i
            i += 1
            continue
        i += 1
    return ranges


def _in_range(pos: int, ranges: list[tuple[int, int]]) -> bool:
    for s, e in ranges:
        if s <= pos < e:
            return True
    return False


def replace_outside_strings(text: str, pattern: str, replacement: str, str_ranges: list[tuple[int, int]]) -> str:
    """Replace pattern only when match is not inside a string literal."""
    result = []
    last = 0
    for m in re.finditer(pattern, text):
        if not _in_range(m.start(), str_ranges):
            result.append(text[last : m.start()])
            result.append(replacement)
            last = m.end()
    result.append(text[last:])
    return "".join(result)


def beautify_js(js_content: str) -> str:
    """Basic JS formatting for readability."""
    try:
        import jsbeautifier
        opts = jsbeautifier.default_options()
        opts.indent_size = 2
        opts.wrap_line_length = 120
        return jsbeautifier.beautify(js_content, opts)
    except ImportError:
        # Fallback: newlines after semicolons (avoid breaking strings)
        lines = []
        in_str = None
        escape = False
        i = 0
        buf = []
        while i < len(js_content):
            c = js_content[i]
            if escape:
                buf.append(c)
                escape = False
                i += 1
                continue
            if c == "\\" and in_str:
                buf.append(c)
                escape = True
                i += 1
                continue
            if in_str:
                buf.append(c)
                if c == in_str:
                    in_str = None
                i += 1
                continue
            if c in ("'", '"', "`"):
                in_str = c
                buf.append(c)
                i += 1
                continue
            if c == ";" and buf:
                buf.append(";")
                lines.append("".join(buf).strip())
                buf = []
                i += 1
                continue
            buf.append(c)
            i += 1
        if buf:
            lines.append("".join(buf).strip())
        return "\n".join(lines)


def deobfuscate_js(js_content: str, mapping: dict[str, str]) -> str:
    """Replace obfuscated names with human-readable ones. Returns deobfuscated JS."""
    result = js_content

    # Split into property-style (obj.prop) and simple identifiers
    prop_mappings = []  # (pattern, replacement) e.g. ("o.xx", "o.headX")
    simple_mappings = []  # (obf, human) e.g. ("fr", "frameCounter")

    for obf, human in mapping.items():
        if obf in SIMPLE_ID_BLACKLIST:
            continue
        if "." in obf:
            obj, prop = obf.split(".", 1)
            # Replace obj.prop with obj.humanName
            prop_mappings.append((obf, f"{obj}.{human}"))
        else:
            simple_mappings.append((obf, human))

    # 1. Property-style: replace longest first to avoid partial matches
    for obf, repl in sorted(prop_mappings, key=lambda x: -len(x[0])):
        result = result.replace(obf, repl)

    # 2. Simple identifiers: use word boundary, longest first
    for obf, human in sorted(simple_mappings, key=lambda x: -len(x[0])):
        pattern = r"\b" + re.escape(obf) + r"\b"
        if obf in STRING_CONTEXT_IDS:
            str_ranges = _get_string_ranges(result)
            result = replace_outside_strings(result, pattern, human, str_ranges)
        else:
            result = re.sub(pattern, human, result)

    return result


def main():
    script_dir = Path(__file__).parent
    game_js = script_dir / "game.js"
    output_json = script_dir / "var_mapping.json"
    output_js = script_dir / "game_deobfuscated.js"

    if not game_js.exists():
        print(f"Error: {game_js} not found", file=sys.stderr)
        sys.exit(1)

    js_content = game_js.read_text(encoding="utf-8", errors="replace")
    mapping = build_mapping(js_content)

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(mapping)} mappings to {output_json}")

    # Produce deobfuscated game.js
    deobfuscated = deobfuscate_js(js_content, mapping)
    formatted = beautify_js(deobfuscated)
    output_js.write_text(formatted, encoding="utf-8")
    print(f"Wrote deobfuscated + formatted JS to {output_js}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
