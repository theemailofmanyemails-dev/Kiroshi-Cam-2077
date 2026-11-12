import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Activity, AlignJustify, Wind, Zap, RefreshCcw, Video,
  Layers, Upload, Tv, Film, Glasses, Clock, Grid, Scan, Sun,
  Eye, EyeOff, Focus, Settings, X, SlidersHorizontal, Shuffle, Wand2,
  Ban, Compass, Aperture, Bookmark, Contrast, Layout,
  Palette, Hash, Droplets, Save, Waves, Type, Cpu, MoreHorizontal,
  Sparkles, Maximize2, Image as ImageIcon, Check, Box, Flame, Download, Trash2
} from 'lucide-react';

// ============================================================================
// PART 1: ISOLATED HEADLESS WEBGL2 FX ENGINE & SCHEMA (Zero UI Dependencies)
// ============================================================================

export const BAYER_MATRIX = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5
];

export const ASCII_SETS = {
  CLASSIC: " .:-=+*#%@",
  MATRIX: " ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ10",
  BRAILLE: " ⠐⠤⠬⠭⠱⠵⠻⠟⠯⠽⠿",
  BLOCKS: " ░▒▓█",
  BINARY: " 01",
  HEX: " 0123456789ABCDEF",
  TECH: " []{}()<>\\/|",
  GLITCH: " !<>-_\\\\/[]{}—=+*^?#",
  ENOCHIAN: " ⰀⰁⰂⰃⰄⰅⰆⰇⰈⰉⰊⰋⰌⰍⰎⰏⰐⰑⰒⰓⰔⰕⰖⰗⰘⰙⰚⰛⰜⰝⰞⰟⰠⰡⰢⰣⰤⰥⰦⰧⰨⰩⰪⰫⰬⰭⰮ"
};

export const THERMAL_PALETTES = [
  'CLASSIC', 'INFERNO', 'CYBER', 'VAPOR', 'GAMEBOY', 'MATRIX',
  'CRIMSON', 'DEEP_SEA', 'SEPIA', 'X_RAY', 'TOXIC', 'NEON_ICE', 'SOLAR'
];

export const FX_REGISTRY = [
  { id: 'trails',       index: 0,  label: 'TRAILS',    color: '#00E5FF', defaultIntensity: 70 },
  { id: 'thermal',      index: 1,  label: 'THERM',     color: '#FF3366', defaultIntensity: 100 },
  { id: 'scanlines',    index: 2,  label: 'LINES',     color: '#A3E635', defaultIntensity: 50 },
  { id: 'crt',          index: 3,  label: 'CRT',       color: '#FFB800', defaultIntensity: 60 },
  { id: 'glitch',       index: 4,  label: 'GLITCH',    color: '#FF00E5', defaultIntensity: 50 },
  { id: 'artifact',     index: 5,  label: 'ARTIFACT',  color: '#00F5D4', defaultIntensity: 50 },
  { id: 'smear',        index: 6,  label: 'SMEAR',     color: '#FF6B00', defaultIntensity: 60 },
  { id: 'mosh',         index: 7,  label: 'MOSH',      color: '#C084FC', defaultIntensity: 50 },
  { id: 'kaleidoscope', index: 8,  label: 'KALEIDO',   color: '#F43F5E', defaultIntensity: 50 },
  { id: 'vhs',          index: 9,  label: 'VHS',       color: '#38BDF8', defaultIntensity: 50 },
  { id: 'anaglyph',     index: 10, label: '3D',        color: '#EF4444', defaultIntensity: 50 },
  { id: 'slowMo',       index: 11, label: 'SLOW-MO',   color: '#FACC15', defaultIntensity: 50 },
  { id: 'pixel',        index: 12, label: 'PIXEL',     color: '#4ADE80', defaultIntensity: 50 },
  { id: 'edge',         index: 13, label: 'EDGE',      color: '#2DD4BF', defaultIntensity: 100 },
  { id: 'glow',         index: 14, label: 'GLOW',      color: '#FBBF24', defaultIntensity: 50 },
  { id: 'nvg',          index: 15, label: 'NVG',       color: '#84CC16', defaultIntensity: 100 },
  { id: 'invert',       index: 16, label: 'INVERT',    color: '#E879F9', defaultIntensity: 100 },
  { id: 'rgbSplit',     index: 17, label: 'RGB SPLIT', color: '#FB7185', defaultIntensity: 50 },
  { id: 'posterize',    index: 18, label: 'POSTER',    color: '#FB923C', defaultIntensity: 50 },
  { id: 'dither',       index: 19, label: 'DITHER',    color: '#A78BFA', defaultIntensity: 50 },
  { id: 'ascii',        index: 20, label: 'ASCII',     color: '#34D399', defaultIntensity: 50 },
  { id: 'fontslop',     index: 21, label: 'FONTSLOP',  color: '#F472B6', defaultIntensity: 50 },
  { id: 'warp',         index: 22, label: 'WARP',      color: '#60A5FA', defaultIntensity: 50 }
];

export const DEFAULT_INTENSITIES = FX_REGISTRY.reduce((acc, fx) => {
  acc[fx.id] = fx.defaultIntensity;
  return acc;
}, {});

export const DEFAULT_TOGGLES = FX_REGISTRY.reduce((acc, fx) => {
  acc[fx.id] = false;
  return acc;
}, {});

export const PRESETS = {
  CYBER:       { color: '#00E5FF', toggles: { vhs: true, glitch: true, scanlines: true, anaglyph: true, rgbSplit: true }, intensities: { vhs: 85, glitch: 40, scanlines: 60, anaglyph: 30, rgbSplit: 40 } },
  GHOST:       { color: '#C084FC', toggles: { trails: true, glow: true, mosh: true, invert: true }, intensities: { trails: 85, glow: 60, mosh: 20, invert: 100 } },
  ACID:        { color: '#A3E635', toggles: { thermal: true, kaleidoscope: true, trails: true, edge: true, warp: true }, intensities: { thermal: 100, kaleidoscope: 50, trails: 60, edge: 80, warp: 40 }, palette: 'INFERNO' },
  LOFI:        { color: '#FFB800', toggles: { pixel: true, mosh: true, vhs: true, slowMo: true, posterize: true }, intensities: { pixel: 80, mosh: 60, vhs: 70, slowMo: 40, posterize: 80 } },
  TACTICAL:    { color: '#4ADE80', toggles: { nvg: true, scanlines: true, edge: true, ascii: true }, intensities: { nvg: 90, scanlines: 40, edge: 50, ascii: 75 } },
  VAPOR:       { color: '#FF2A85', toggles: { thermal: true, smear: true, vhs: true, scanlines: true }, intensities: { thermal: 100, smear: 80, vhs: 45, scanlines: 30 }, palette: 'VAPOR' },
  MATRIX:      { color: '#10B981', toggles: { ascii: true, nvg: true, scanlines: true }, intensities: { ascii: 80, nvg: 90, scanlines: 70 }, asciiSet: 'MATRIX' },
  CORRUPT:     { color: '#F43F5E', toggles: { mosh: true, glitch: true, smear: true, rgbSplit: true, warp: true }, intensities: { mosh: 80, glitch: 75, smear: 60, rgbSplit: 60, warp: 35 } },
  RETRO:       { color: '#FB923C', toggles: { pixel: true, posterize: true, rgbSplit: true, vhs: true, crt: true }, intensities: { pixel: 70, posterize: 90, rgbSplit: 35, vhs: 60, crt: 65 } },
  GB_CAMERA:   { color: '#84CC16', toggles: { pixel: true, thermal: true, scanlines: true, dither: true }, intensities: { pixel: 23, thermal: 100, scanlines: 92, dither: 75 }, palette: 'GAMEBOY' },
  RITUAL:      { color: '#EF4444', toggles: { thermal: true, kaleidoscope: true, ascii: true, trails: true, glow: true, warp: true, edge: true }, intensities: { thermal: 100, kaleidoscope: 25, ascii: 85, trails: 75, glow: 70, warp: 20, edge: 50 }, palette: 'CRIMSON', asciiSet: 'ENOCHIAN' },
  ELDRITCH:    { color: '#A855F7', toggles: { thermal: true, ascii: true, warp: true, trails: true, rgbSplit: true, mosh: true }, intensities: { thermal: 100, ascii: 50, warp: 80, trails: 85, rgbSplit: 70, mosh: 20 }, palette: 'TOXIC', asciiSet: 'ENOCHIAN' },
  MELTDOWN:    { color: '#FF6B00', toggles: { artifact: true, glitch: true, rgbSplit: true, pixel: true, mosh: true }, intensities: { artifact: 85, glitch: 60, rgbSplit: 80, pixel: 25, mosh: 40 } },
  PS1_DREAM:   { color: '#38BDF8', toggles: { dither: true, pixel: true, rgbSplit: true }, intensities: { dither: 60, pixel: 15, rgbSplit: 20 } },
  AR_NEURAL:   { color: '#00F0FF', toggles: { edge: true, glow: true, rgbSplit: true }, intensities: { edge: 85, glow: 60, rgbSplit: 35 } },
  BLACKWALL:   { color: '#FF003C', toggles: { thermal: true, glitch: true, edge: true, fontslop: true, rgbSplit: true }, intensities: { thermal: 100, glitch: 85, edge: 95, fontslop: 75, rgbSplit: 80 }, palette: 'CRIMSON', asciiSet: 'GLITCH' },
  SANDY_MK5:   { color: '#FCEE0A', toggles: { trails: true, thermal: true, glow: true, rgbSplit: true }, intensities: { trails: 92, thermal: 100, glow: 75, rgbSplit: 60 }, palette: 'CYBER' }
};

const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// PASS 1: Temporal Buffer with 3D Holographic Matrix Grid overlay
const FRAG_TEMPORAL = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSourceTex;
uniform sampler2D uPrevSourceTex;
uniform sampler2D uFeedbackTex;

uniform vec2 uResolution;
uniform vec2 uSourceSize;
uniform vec2 uGyro;
uniform float uTime;
uniform bool uMirror;
uniform bool uArMeshEnabled;
uniform float uToggles[23];
uniform float uIntensities[23];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec2 getCoverUv(vec2 uv, vec2 targetRes, vec2 srcRes) {
  float targetAspect = targetRes.x / max(1.0, targetRes.y);
  float srcAspect = srcRes.x / max(1.0, srcRes.y);
  vec2 scale = vec2(1.0);
  if (targetAspect > srcAspect) {
    scale.y = srcAspect / targetAspect;
  } else {
    scale.x = targetAspect / srcAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = vUv;
  vec2 coverUv = getCoverUv(uv, uResolution, uSourceSize);
  vec2 srcUv = uMirror ? vec2(1.0 - coverUv.x, coverUv.y) : coverUv;

  vec3 srcCol = texture(uSourceTex, clamp(srcUv, 0.0, 1.0)).rgb;
  vec3 prevSrcCol = texture(uPrevSourceTex, clamp(srcUv, 0.0, 1.0)).rgb;
  vec3 outCol = srcCol;

  // AR 3D Holographic Wireframe Grid Overlay Effect
  if (uArMeshEnabled) {
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= uResolution.x / uResolution.y;
    // 3D Perspective Grid Warp
    vec2 gridUv = vec2(p.x / (p.y + 1.8) + uTime * 0.15, 1.0 / (p.y + 1.8) + uTime * 0.2);
    vec2 gridCheck = abs(fract(gridUv * 12.0) - 0.5);
    float line = step(0.42, max(gridCheck.x, gridCheck.y));
    vec3 arTint = vec3(0.0, 0.94, 1.0) * line * 0.45;
    outCol = mix(outCol, outCol + arTint, 0.65);

    // Neural face tracking scan rings near center
    float d = length(p + vec2(0.0, 0.1));
    if (d > 0.35 && d < 0.38) {
      outCol = mix(outCol, vec3(1.0, 0.0, 0.38), 0.85);
    }
  }

  // 7: MOSH
  if (uToggles[7] > 0.5) {
    float moshInt = uIntensities[7] / 100.0;
    float blockY = floor(uv.y * 18.0);
    float rnd = hash(vec2(blockY, floor(uTime * 12.0)));
    if (rnd < 0.85 * moshInt) {
      vec2 disp = vec2(
        (hash(vec2(blockY, uTime)) - 0.5) * 0.08 + uGyro.x * 0.04,
        (hash(vec2(uTime, blockY)) - 0.5) * 0.03 + uGyro.y * 0.04
      );
      vec3 fb = texture(uFeedbackTex, clamp(uv + disp, 0.0, 1.0)).rgb;
      outCol = mix(fb, srcCol, 0.06);
    }
  }

  // 6: SMEAR (Decoupled from Mosh so both can stack simultaneously)
  if (uToggles[6] > 0.5) {
    float smearInt = uIntensities[6] / 100.0;
    vec2 drift = uGyro * 0.015;
    vec3 fb = texture(uFeedbackTex, clamp(uv - drift, 0.0, 1.0)).rgb;
    float alpha = max(0.04, 1.0 - smearInt * 0.92);
    outCol = mix(fb, outCol, alpha);
  }

  // 0: TRAILS
  if (uToggles[0] > 0.5) {
    float trailInt = uIntensities[0] / 100.0;
    vec3 diff = abs(srcCol - prevSrcCol);
    float hue = fract((uTime * 0.12 + uGyro.x * 0.3));
    vec3 tint = hsl2rgb(vec3(hue, 1.0, 0.5)) * diff * 2.4;
    vec3 prevFeedback = texture(uFeedbackTex, uv).rgb;
    float decay = clamp(0.6 + trailInt * 0.38, 0.6, 0.985);
    outCol = max(outCol, prevFeedback * decay + tint);
  }

  fragColor = vec4(clamp(outCol, 0.0, 1.0), 1.0);
}`;

const FRAG_MAIN = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTemporalTex;
uniform sampler2D uLutTex;
uniform sampler2D uAsciiTex;

uniform vec2 uResolution;
uniform vec2 uGyro;
uniform vec4 uPointer; // xy: normalized coords, z: active press, w: pulse age
uniform bool uHoloTiltEnabled;
uniform float uTime;
uniform float uAsciiCount;
uniform float uToggles[23];
uniform float uIntensities[23];

const int BAYER[16] = int[16](
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5
);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 sampleScene(vec2 uv) {
  return texture(uTemporalTex, clamp(uv, 0.0, 1.0)).rgb;
}

void main() {
  vec2 uv = vUv;

  // Interactive 3D Holo-Relief Topographic Projection Mode
  if (uHoloTiltEnabled) {
    vec2 p = uv - 0.5;
    float tiltY = 0.52 + uGyro.y * 0.25;
    float z = 1.0 - p.y * tiltY;
    vec2 projUv = vec2(p.x / max(0.25, z), p.y / max(0.25, z)) + 0.5;
    if (projUv.x < 0.02 || projUv.x > 0.98 || projUv.y < 0.02 || projUv.y > 0.98) {
      vec2 bgGrid = abs(fract(projUv * 24.0) - 0.5);
      float gLine = step(0.46, max(bgGrid.x, bgGrid.y));
      fragColor = vec4(vec3(0.0, 0.22, 0.3) * gLine, 1.0);
      return;
    }
    vec3 baseSample = sampleScene(projUv);
    float lumHeight = dot(baseSample, vec3(0.299, 0.587, 0.114));
    uv = projUv + vec2(0.0, (lumHeight - 0.3) * 0.085);
  }

  // Interactive Touch/Click Gravity Shockwave Anomaly
  if (uPointer.w < 1.5 || uPointer.z > 0.5) {
    vec2 aspect = vec2(uResolution.x / max(1.0, uResolution.y), 1.0);
    vec2 delta = (uv - uPointer.xy) * aspect;
    float dist = length(delta);
    vec2 dir = dist > 0.0001 ? delta / dist : vec2(0.0);

    // Expanding shockwave ring on tap
    if (uPointer.w < 1.2) {
      float ringRadius = uPointer.w * 0.85;
      float ringBand = exp(-pow((dist - ringRadius) * 18.0, 2.0));
      uv -= dir * ringBand * 0.06 * (1.0 - uPointer.w / 1.2);
    }

    // Continuous vortex lens while dragging/holding
    if (uPointer.z > 0.5 && dist < 0.38) {
      float pull = smoothstep(0.38, 0.0, dist);
      float angle = pull * 2.4;
      float s = sin(angle), c = cos(angle);
      vec2 rotDelta = vec2(delta.x * c - delta.y * s, delta.x * s + delta.y * c);
      uv = uPointer.xy + (rotDelta / aspect) * (1.0 - pull * 0.35);
    }
  }

  if (uToggles[3] > 0.5) {
    float crtAmt = (uIntensities[3] / 100.0) * 0.25;
    vec2 dc = uv - 0.5;
    dc *= 1.0 + dot(dc, dc) * crtAmt;
    uv = dc + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      fragColor = vec4(0.04, 0.04, 0.05, 1.0);
      return;
    }
  }

  bool isAscii = (uToggles[20] > 0.5) || (uToggles[21] > 0.5);
  float cellSize = 12.0;
  vec2 cellUv = vec2(0.0);
  vec2 cellId = vec2(0.0);
  if (isAscii) {
    float activeGlyphInt = uToggles[20] > 0.5 ? uIntensities[20] : uIntensities[21];
    cellSize = max(8.0, floor(22.0 - (activeGlyphInt / 100.0) * 14.0));
    vec2 grid = uResolution / cellSize;
    cellId = floor(uv * grid);
    cellUv = fract(uv * grid);
    uv = (cellId + 0.5) / grid;
  }

  if (uToggles[12] > 0.5) {
    float scale = max(0.02, 0.35 - (uIntensities[12] / 100.0) * 0.32);
    vec2 pGrid = max(vec2(4.0), floor(uResolution * scale));
    uv = (floor(uv * pGrid) + 0.5) / pGrid;
  }

  if (uToggles[8] > 0.5) {
    float segments = max(4.0, floor(4.0 + (uIntensities[8] / 100.0) * 8.0));
    vec2 centered = uv - 0.5;
    float rad = length(centered);
    float ang = atan(centered.y, centered.x);
    float slice = 6.2831853 / segments;
    ang = mod(ang, slice);
    ang = abs(ang - slice * 0.5);
    uv = vec2(cos(ang), sin(ang)) * rad + 0.5;
  }

  if (uToggles[22] > 0.5) {
    float amp = (uIntensities[22] / 100.0) * 0.04;
    uv.x += sin(uv.y * 25.0 + uTime * 6.0) * amp;
    uv.y += cos(uv.x * 20.0 + uTime * 4.0) * (amp * 0.5);
  }

  if (uToggles[4] > 0.5) {
    float gInt = uIntensities[4] / 100.0;
    float sliceY = floor(uv.y * 28.0);
    float n = hash(vec2(sliceY, floor(uTime * 18.0)));
    if (n < gInt * 0.45) {
      uv.x += (hash(vec2(uTime, sliceY)) - 0.5) * gInt * 0.25;
    }
  }

  if (uToggles[5] > 0.5) {
    float aInt = uIntensities[5] / 100.0;
    vec2 block = floor(uv * (uResolution / 16.0));
    float bRnd = hash(block + floor(uTime * 10.0));
    if (bRnd < aInt * 0.22) {
      vec2 jitter = vec2(hash(block) - 0.5, hash(block.yx) - 0.5) * 0.15;
      uv += jitter;
    }
  }

  float vhsLine = 0.0;
  if (uToggles[9] > 0.5) {
    float vhsInt = uIntensities[9] / 100.0;
    float bandCenter = fract(uTime * 0.18);
    float bandHalf = 0.02 + vhsInt * 0.05;
    float dist = abs(uv.y - bandCenter);
    if (dist < bandHalf) {
      uv.x += (hash(vec2(uv.y, uTime)) - 0.5) * 0.04 * vhsInt;
      vhsLine = smoothstep(bandHalf, 0.0, dist) * vhsInt * 0.25;
    }
  }

  vec3 col = sampleScene(uv);

  if (uToggles[17] > 0.5) {
    vec2 split = vec2((uIntensities[17] / 100.0) * 0.03, 0.0) + uGyro * 0.01;
    col.r = sampleScene(uv + split).r;
    col.b = sampleScene(uv - split).b;
  }

  if (uToggles[10] > 0.5) {
    vec2 ana = vec2((uIntensities[10] / 100.0) * 0.03, 0.0);
    float rL = sampleScene(uv - ana).r;
    vec2 gbR = sampleScene(uv + ana).gb;
    col = vec3(rL, gbR);
  }

  if (uToggles[13] > 0.5) {
    vec2 texel = 1.0 / uResolution;
    vec3 cR = sampleScene(uv + vec2(texel.x, 0.0));
    vec3 cD = sampleScene(uv + vec2(0.0, texel.y));
    float diff = length(col - cR) + length(col - cD);
    float thresh = 0.55 - (uIntensities[13] / 100.0) * 0.45;
    col = diff > thresh ? vec3(min(1.0, diff * 2.5)) : vec3(0.0);
  }

  if (uToggles[14] > 0.5) {
    float gAmt = uIntensities[14] / 100.0;
    vec2 rad = (2.0 + gAmt * 6.0) / uResolution;
    vec3 bloom = (
      sampleScene(uv + vec2(rad.x, 0.0)) +
      sampleScene(uv - vec2(rad.x, 0.0)) +
      sampleScene(uv + vec2(0.0, rad.y)) +
      sampleScene(uv - vec2(0.0, rad.y)) +
      sampleScene(uv + rad) +
      sampleScene(uv - rad)
    ) / 6.0;
    col = 1.0 - (1.0 - col) * (1.0 - bloom * gAmt * 0.9);
  }

  // 1: THERMAL (Uses uIntensities[1] to drive thermal contrast & dry/wet blend)
  if (uToggles[1] > 0.5) {
    float thermInt = clamp(uIntensities[1] / 100.0, 0.01, 1.0);
    float rawLum = dot(col, vec3(0.299, 0.587, 0.114));
    float contrastBoost = 0.65 + thermInt * 0.75;
    float shapedLum = clamp((rawLum - 0.5) * contrastBoost + 0.5, 0.0, 1.0);
    vec3 thermCol = texture(uLutTex, vec2(shapedLum, 0.5)).rgb;
    col = mix(col, thermCol, clamp(thermInt * 1.15, 0.15, 1.0));
  } else if (uToggles[18] > 0.5) {
    float levels = max(2.0, floor(12.0 - (uIntensities[18] / 100.0) * 10.0));
    col = floor(col * levels + 0.5) / levels;
  }

  // 15: NVG (Uses uIntensities[15] for both phosphor blend and sensor noise)
  if (uToggles[15] > 0.5) {
    float nvgInt = clamp(uIntensities[15] / 100.0, 0.01, 1.0);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float grain = (hash(uv * uResolution + uTime) - 0.5) * nvgInt * 0.35;
    vec3 nvgCol = vec3(0.0, clamp(lum * (1.0 + nvgInt * 0.6) + grain, 0.0, 1.0), clamp(lum * 0.25, 0.0, 1.0));
    col = mix(col, nvgCol, clamp(nvgInt * 1.2, 0.2, 1.0));
  }

  // 16: INVERT (Uses uIntensities[16] for phase inversion blend)
  if (uToggles[16] > 0.5) {
    col = mix(col, 1.0 - col, clamp(uIntensities[16] / 100.0, 0.01, 1.0));
  }

  // 19: DITHER (Scales quantization depth dynamically with uIntensities[19])
  if (uToggles[19] > 0.5) {
    float dInt = clamp(uIntensities[19] / 100.0, 0.01, 1.0);
    ivec2 px = ivec2(gl_FragCoord.xy) & 3;
    float bayer = float(BAYER[px.x + (px.y << 2)]) / 16.0 - 0.5;
    float spread = dInt * 0.32;
    float qLevels = max(2.0, floor(16.0 - dInt * 13.0));
    col = clamp(col + bayer * spread, 0.0, 1.0);
    col = floor(col * qLevels + 0.5) / qLevels;
  }

  // 20 / 21: ASCII & FONTSLOP Glyph Atlas Masking
  if (isAscii) {
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float charIdx = floor(clamp(lum, 0.0, 0.999) * uAsciiCount);
    vec2 glyphUv = cellUv;

    if (uToggles[21] > 0.5) {
      float slopInt = clamp(uIntensities[21] / 100.0, 0.05, 1.0);
      float j = hash(cellId + floor(uTime * (4.0 + slopInt * 10.0)));
      float scale = (1.0 - slopInt * 0.45) + j * (slopInt * 0.95);
      glyphUv = clamp((glyphUv - 0.5) * scale + 0.5, 0.0, 1.0);
    }

    vec2 atlasUv = vec2((charIdx + glyphUv.x) / uAsciiCount, glyphUv.y);
    float mask = texture(uAsciiTex, atlasUv).r;
    col *= mask;
  }

  // Add VHS tracking noise highlight
  col += vhsLine;

  // 3D Holo-Relief Scanline Wireframe Contour Overlay
  if (uHoloTiltEnabled) {
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float scanWave = abs(fract(uv.y * 55.0 - lum * 2.5) - 0.5);
    float wire = smoothstep(0.18, 0.02, scanWave);
    col = mix(col * 0.65, col + vec3(0.0, 0.95, 1.0) * wire * 0.75, 0.85);
  }

  // Highlight ring around active touch shockwave
  if (uPointer.w < 1.2) {
    vec2 aspect = vec2(uResolution.x / max(1.0, uResolution.y), 1.0);
    float dist = length((vUv - uPointer.xy) * aspect);
    float glowRing = exp(-pow((dist - uPointer.w * 0.85) * 28.0, 2.0)) * (1.0 - uPointer.w / 1.2);
    col += vec3(0.0, 0.94, 1.0) * glowRing * 0.75;
  }

  // 2: SCANLINES
  if (uToggles[2] > 0.5) {
    float line = mod(floor(gl_FragCoord.y), 4.0) < 2.0 ? 1.0 : (1.0 - (uIntensities[2] / 100.0) * 0.65);
    col *= line;
  }

  if (uToggles[3] > 0.5) {
    float dist = length(vUv - 0.5) * 1.45;
    float vig = smoothstep(0.35, 1.05, dist) * (uIntensities[3] / 100.0) * 0.9;
    col *= (1.0 - vig);
  }

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export class FXEngine {
  constructor(options = {}) {
    this.maxResolution = options.maxResolution || 840;
    this.minFrameInterval = options.minFrameInterval || 16;

    this.targetCanvas = null;
    this.gl = null;
    this.sourceEl = null;
    this.sourceType = 'camera';
    this.mirrorSource = false;
    this.aspectRatio = null;
    this.arMeshEnabled = false;
    this.holoTiltEnabled = false;
    this.pointer = { x: 0.5, y: 0.5, active: 0, triggerTime: -10 };

    this.state = {
      toggles: { ...DEFAULT_TOGGLES },
      intensities: { ...DEFAULT_INTENSITIES },
      palette: 'CLASSIC',
      asciiSet: 'CLASSIC'
    };

    this.gyro = { gX: 0, gY: 0 };
    this.uniformToggles = new Float32Array(23);
    this.uniformIntensities = new Float32Array(23);

    this.progTemporal = null;
    this.progMain = null;
    this.uTemporalLocs = {};
    this.uMainLocs = {};
    this.vao = null;
    this.vbo = null;
    this.texSource = null;
    this.texPrevSource = null;
    this.texLut = null;
    this.texAscii = null;
    this.fboA = null;
    this.fboB = null;
    this.pingPong = 0;
    this.fboWidth = 0;
    this.fboHeight = 0;

    this.lutDirty = true;
    this.asciiDirty = true;
    this.asciiCharCount = Array.from(ASCII_SETS.CLASSIC).length;

    this.rafId = null;
    this.startTime = performance.now();
    this.lastRenderTime = 0;
    this.lastSourceUpdateTime = 0;
    this._boundLoop = this._loop.bind(this);
    this._syncUniformArrays();
  }

  setTarget(canvasElement) {
    this.targetCanvas = canvasElement;
    if (!canvasElement) {
      this.gl = null;
      return;
    }
    const gl = canvasElement.getContext('webgl2', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true
    });
    if (!gl) return;
    this.gl = gl;
    this._initGL();
  }

  setSource(element, type = 'camera', mirror = false) {
    this.sourceEl = element;
    this.sourceType = type;
    this.mirrorSource = Boolean(mirror);
  }

  setAspectRatio(numericRatio) {
    this.aspectRatio = numericRatio || null;
  }

  setArMesh(enabled) {
    this.arMeshEnabled = Boolean(enabled);
  }

  setHoloTilt(enabled) {
    this.holoTiltEnabled = Boolean(enabled);
  }

  setPointer(normX, normY, isPressed = false, triggerPulse = false) {
    this.pointer.x = Math.max(0, Math.min(1, normX));
    this.pointer.y = Math.max(0, Math.min(1, normY));
    this.pointer.active = isPressed ? 1.0 : 0.0;
    if (triggerPulse) {
      this.pointer.triggerTime = (performance.now() - this.startTime) * 0.001;
    }
  }

  /**
   * Samples a 32x16 grid from the center of the active WebGL2 framebuffer
   * to drive the real-time RGB / Luma Optical Oscilloscope HUD.
   */
  sampleScopeMetrics() {
    if (!this.gl || !this.targetCanvas) return null;
    const gl = this.gl;
    const w = this.targetCanvas.width;
    const h = this.targetCanvas.height;
    if (w < 32 || h < 16) return null;

    const sw = 32;
    const sh = 16;
    const buf = new Uint8Array(sw * sh * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(
      Math.floor((w - sw) * 0.5),
      Math.floor((h - sh) * 0.5),
      sw,
      sh,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buf
    );

    const rBins = new Array(sw).fill(0);
    const gBins = new Array(sw).fill(0);
    const bBins = new Array(sw).fill(0);

    for (let x = 0; x < sw; x++) {
      let rSum = 0, gSum = 0, bSum = 0;
      for (let y = 0; y < sh; y++) {
        const idx = (y * sw + x) * 4;
        rSum += buf[idx];
        gSum += buf[idx + 1];
        bSum += buf[idx + 2];
      }
      rBins[x] = Math.round(rSum / sh);
      gBins[x] = Math.round(gSum / sh);
      bBins[x] = Math.round(bSum / sh);
    }
    return { rBins, gBins, bBins };
  }

  updateConfig(partialState) {
    if (partialState.toggles) {
      this.state.toggles = { ...this.state.toggles, ...partialState.toggles };
      if ('posterize' in partialState.toggles) this.lutDirty = true;
    }
    if (partialState.intensities) {
      this.state.intensities = { ...this.state.intensities, ...partialState.intensities };
      if ('posterize' in partialState.intensities) this.lutDirty = true;
    }
    if (partialState.palette && partialState.palette !== this.state.palette) {
      this.state.palette = partialState.palette;
      this.lutDirty = true;
    }
    if (partialState.asciiSet && partialState.asciiSet !== this.state.asciiSet) {
      this.state.asciiSet = partialState.asciiSet;
      this.asciiDirty = true;
    }
    this._syncUniformArrays();
    return this.getConfig();
  }

  applyPreset(presetName) {
    if (presetName === 'NONE' || !PRESETS[presetName]) {
      this.state.toggles = { ...DEFAULT_TOGGLES };
      this.lutDirty = true;
      this._syncUniformArrays();
      return this.getConfig();
    }
    const p = PRESETS[presetName];
    this.state.toggles = { ...DEFAULT_TOGGLES, ...p.toggles };
    this.state.intensities = { ...DEFAULT_INTENSITIES, ...p.intensities };
    if (p.palette) this.state.palette = p.palette;
    if (p.asciiSet) this.state.asciiSet = p.asciiSet;
    this.lutDirty = true;
    this.asciiDirty = true;
    this._syncUniformArrays();
    return this.getConfig();
  }

  setGyro(gX = 0, gY = 0) {
    this.gyro.gX = Math.max(-1, Math.min(1, gX));
    this.gyro.gY = Math.max(-1, Math.min(1, gY));
  }

  getConfig() {
    return JSON.parse(JSON.stringify(this.state));
  }

  exportFrame(highQuality = true) {
    if (!this.targetCanvas) return null;
    return this.targetCanvas.toDataURL('image/jpeg', highQuality ? 0.95 : 0.75);
  }

  start() {
    if (!this.rafId) this.rafId = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.gl) {
      const gl = this.gl;
      [this.texSource, this.texPrevSource, this.texLut, this.texAscii].forEach((t) => t && gl.deleteTexture(t));
      [this.fboA, this.fboB].forEach((f) => {
        if (f) {
          gl.deleteTexture(f.tex);
          gl.deleteFramebuffer(f.fbo);
        }
      });
      if (this.vbo) gl.deleteBuffer(this.vbo);
      if (this.vao) gl.deleteVertexArray(this.vao);
      if (this.progTemporal) gl.deleteProgram(this.progTemporal);
      if (this.progMain) gl.deleteProgram(this.progMain);
    }
    this.gl = null;
    this.targetCanvas = null;
    this.sourceEl = null;
  }

  _syncUniformArrays() {
    for (let i = 0; i < FX_REGISTRY.length; i++) {
      const id = FX_REGISTRY[i].id;
      this.uniformToggles[i] = this.state.toggles[id] ? 1.0 : 0.0;
      this.uniformIntensities[i] = this.state.intensities[id] ?? 50.0;
    }
  }

  _compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  _createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const prog = gl.createProgram();
    const vs = this._compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this._compileShader(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  _createTexture(filter = this.gl.LINEAR) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    return tex;
  }

  _initGL() {
    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    this.progTemporal = this._createProgram(VERTEX_SHADER, FRAG_TEMPORAL);
    this.progMain = this._createProgram(VERTEX_SHADER, FRAG_MAIN);

    // Pre-cache all Uniform Locations once (eliminates 20+ string lookups per frame)
    const cacheLocs = (prog, names) => {
      const map = {};
      names.forEach((n) => { map[n] = gl.getUniformLocation(prog, n); });
      return map;
    };

    this.uTemporalLocs = cacheLocs(this.progTemporal, [
      'uSourceTex', 'uPrevSourceTex', 'uFeedbackTex', 'uResolution',
      'uSourceSize', 'uGyro', 'uTime', 'uMirror', 'uArMeshEnabled',
      'uToggles', 'uIntensities'
    ]);

    this.uMainLocs = cacheLocs(this.progMain, [
      'uTemporalTex', 'uLutTex', 'uAsciiTex', 'uResolution',
      'uGyro', 'uPointer', 'uHoloTiltEnabled', 'uTime',
      'uAsciiCount', 'uToggles', 'uIntensities'
    ]);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    const posLoc = gl.getAttribLocation(this.progTemporal, 'aPos');
    const safeLoc = posLoc >= 0 ? posLoc : 0;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(safeLoc);
    gl.vertexAttribPointer(safeLoc, 2, gl.FLOAT, false, 0, 0);

    this.texSource = this._createTexture(gl.LINEAR);
    this.texPrevSource = this._createTexture(gl.LINEAR);
    this.texLut = this._createTexture(gl.NEAREST);
    this.texAscii = this._createTexture(gl.LINEAR);

    this.lutDirty = true;
    this.asciiDirty = true;
  }

  _ensureFBOs(w, h) {
    if (this.fboA && this.fboWidth === w && this.fboHeight === h) return;
    const gl = this.gl;

    const makeFBO = () => {
      const tex = this._createTexture(gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { fbo, tex };
    };

    if (this.fboA) {
      gl.deleteTexture(this.fboA.tex);
      gl.deleteFramebuffer(this.fboA.fbo);
      gl.deleteTexture(this.fboB.tex);
      gl.deleteFramebuffer(this.fboB.fbo);
    }

    this.fboA = makeFBO();
    this.fboB = makeFBO();
    this.fboWidth = w;
    this.fboHeight = h;

    gl.bindTexture(gl.TEXTURE_2D, this.texPrevSource);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  _uploadLUT() {
    const gl = this.gl;
    const { palette, intensities: i, toggles: t } = this.state;
    const pLevels = Math.max(2, Math.floor(12 - (i.posterize / 100) * 10));
    const pFact = 255 / (pLevels - 1);
    const pLUT = new Uint8Array(256);
    const data = new Uint8Array(256 * 4);

    for (let j = 0; j < 256; j++) pLUT[j] = Math.round(j / pFact) * pFact;

    for (let lum = 0; lum < 256; lum++) {
      let r = 0, g = 0, b = 0;
      if (palette === 'GAMEBOY') {
        const gb = lum < 64 ? [15, 56, 15] : lum < 128 ? [48, 98, 48] : lum < 192 ? [139, 172, 15] : [155, 188, 15];
        [r, g, b] = gb;
      } else if (palette === 'MATRIX') { g = lum * 1.5; }
      else if (palette === 'CRIMSON') { r = lum * 1.5; }
      else if (palette === 'DEEP_SEA') { b = lum < 128 ? lum * 2 : 255; g = lum < 128 ? 0 : (lum - 128) * 2; }
      else if (palette === 'SEPIA') { r = lum * 1.2; g = lum * 0.9; b = lum * 0.6; }
      else if (palette === 'X_RAY') { r = lum * 0.6; g = lum * 1.1; b = lum * 1.2; }
      else if (palette === 'TOXIC') { r = lum < 128 ? lum : 128 + (lum - 128); g = lum < 128 ? 0 : (lum - 128) * 2; b = lum < 128 ? lum * 2 : 255 - (lum - 128) * 2; }
      else if (palette === 'NEON_ICE') { r = lum < 128 ? lum * 2 : 255 - (lum - 128) * 2; g = lum < 128 ? 0 : (lum - 128) * 2; b = lum < 128 ? lum * 2 : 255; }
      else if (palette === 'SOLAR') { r = lum < 128 ? lum * 1.96 : 252 + (lum - 128) * 0.02; g = lum < 128 ? lum * 1.86 : 238 + (lum - 128) * 0.13; b = lum < 128 ? lum * 0.09 : 12 + (lum - 128) * 1.91; }
      else {
        const l2 = Math.max(0, lum - 64), l3 = Math.max(0, lum - 128), l4 = Math.max(0, lum - 192);
        if (lum < 64) {
          if (palette === 'INFERNO') r = lum * 4;
          else if (palette === 'CYBER') { r = lum * 3; b = lum * 4; }
          else if (palette === 'VAPOR') { r = lum * 2.5; b = 255; }
          else b = lum * 4;
        } else if (lum < 128) {
          if (palette === 'INFERNO') { r = 255; g = l2 * 4; }
          else if (palette === 'CYBER') { r = Math.max(0, 189 - l2 * 3); g = l2 * 4; b = 255; }
          else if (palette === 'VAPOR') { r = 160 + l2 * 1.5; b = 255; }
          else { r = l2 * 4; b = 255 - l2 * 4; }
        } else if (lum < 192) {
          if (palette === 'INFERNO') { r = 255; g = 255; b = l3 * 4; }
          else if (palette === 'CYBER') { r = l3 * 4; g = 255; b = 255; }
          else if (palette === 'VAPOR') { r = 255 - l3 * 4; g = l3 * 4; b = 255 - l3 * 4; }
          else { r = 255; g = l3 * 4; }
        } else {
          if (palette === 'VAPOR') { r = l4 * 4; g = 255; }
          else if (palette === 'CLASSIC') { r = 255; g = 255; b = l4 * 4; }
          else { r = 255; g = 255; b = 255; }
        }
      }
      const clamp = (v) => Math.max(0, Math.min(255, Math.floor(v)));
      const idx = lum * 4;
      data[idx]     = t.posterize ? pLUT[clamp(r)] : clamp(r);
      data[idx + 1] = t.posterize ? pLUT[clamp(g)] : clamp(g);
      data[idx + 2] = t.posterize ? pLUT[clamp(b)] : clamp(b);
      data[idx + 3] = 255;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texLut);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    this.lutDirty = false;
  }

  _uploadAsciiAtlas() {
    const gl = this.gl;
    const chars = Array.from(ASCII_SETS[this.state.asciiSet] || ASCII_SETS.CLASSIC);
    this.asciiCharCount = chars.length;

    const tileSize = 32;
    const atlas = document.createElement('canvas');
    atlas.width = tileSize * chars.length;
    atlas.height = tileSize;
    const ctx = atlas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, atlas.width, atlas.height);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(tileSize * 0.8)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    chars.forEach((ch, idx) => {
      ctx.fillText(ch, idx * tileSize + tileSize / 2, tileSize / 2);
    });

    gl.bindTexture(gl.TEXTURE_2D, this.texAscii);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    this.asciiDirty = false;
  }

  _loop(now) {
    this.rafId = requestAnimationFrame(this._boundLoop);
    if (!this.gl || !this.sourceEl || !this.targetCanvas) return;
    if (now - this.lastRenderTime < this.minFrameInterval) return;

    const srcW = this.sourceType === 'image' ? this.sourceEl.naturalWidth : (this.sourceEl.videoWidth || this.sourceEl.width);
    const srcH = this.sourceType === 'image' ? this.sourceEl.naturalHeight : (this.sourceEl.videoHeight || this.sourceEl.height);
    if (!srcW || !srcH) return;

    this.lastRenderTime = now;
    const gl = this.gl;
    const elapsedSec = (now - this.startTime) * 0.001;

    const activeRatio =
      this.aspectRatio ||
      (this.targetCanvas.clientWidth && this.targetCanvas.clientHeight
        ? this.targetCanvas.clientWidth / this.targetCanvas.clientHeight
        : srcW / srcH);

    let w, h;
    if (activeRatio >= 1) {
      w = this.maxResolution;
      h = Math.max(1, Math.round(this.maxResolution / activeRatio));
    } else {
      h = this.maxResolution;
      w = Math.max(1, Math.round(this.maxResolution * activeRatio));
    }

    if (this.targetCanvas.width !== w || this.targetCanvas.height !== h) {
      this.targetCanvas.width = w;
      this.targetCanvas.height = h;
    }

    this._ensureFBOs(w, h);
    if (this.lutDirty) this._uploadLUT();
    if (this.asciiDirty) this._uploadAsciiAtlas();

    let updateSrc = true;
    if (this.state.toggles.slowMo) {
      if (now - this.lastSourceUpdateTime < (this.state.intensities.slowMo / 100) * 300) {
        updateSrc = false;
      } else {
        this.lastSourceUpdateTime = now;
      }
    }

    if (updateSrc) {
      gl.bindTexture(gl.TEXTURE_2D, this.texSource);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceEl);
    }

    const readFBO = this.pingPong === 0 ? this.fboA : this.fboB;
    const writeFBO = this.pingPong === 0 ? this.fboB : this.fboA;

    gl.viewport(0, 0, w, h);
    gl.bindVertexArray(this.vao);

    // PASS 1: Temporal Buffer with AR Mesh
    const tLoc = this.uTemporalLocs;
    gl.bindFramebuffer(gl.FRAMEBUFFER, writeFBO.fbo);
    gl.useProgram(this.progTemporal);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texSource);
    gl.uniform1i(tLoc.uSourceTex, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texPrevSource);
    gl.uniform1i(tLoc.uPrevSourceTex, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, readFBO.tex);
    gl.uniform1i(tLoc.uFeedbackTex, 2);

    gl.uniform2f(tLoc.uResolution, w, h);
    gl.uniform2f(tLoc.uSourceSize, srcW, srcH);
    gl.uniform2f(tLoc.uGyro, this.gyro.gX, this.gyro.gY);
    gl.uniform1f(tLoc.uTime, elapsedSec);
    gl.uniform1i(tLoc.uMirror, this.mirrorSource ? 1 : 0);
    gl.uniform1i(tLoc.uArMeshEnabled, this.arMeshEnabled ? 1 : 0);
    gl.uniform1fv(tLoc.uToggles, this.uniformToggles);
    gl.uniform1fv(tLoc.uIntensities, this.uniformIntensities);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (updateSrc) {
      gl.bindTexture(gl.TEXTURE_2D, this.texPrevSource);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceEl);
    }

    // PASS 2: Spatial, LUT, Matrix & Post-FX
    const mLoc = this.uMainLocs;
    const pulseAge = Math.max(0.0, elapsedSec - this.pointer.triggerTime);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.progMain);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, writeFBO.tex);
    gl.uniform1i(mLoc.uTemporalTex, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texLut);
    gl.uniform1i(mLoc.uLutTex, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.texAscii);
    gl.uniform1i(mLoc.uAsciiTex, 2);

    gl.uniform2f(mLoc.uResolution, w, h);
    gl.uniform2f(mLoc.uGyro, this.gyro.gX, this.gyro.gY);
    gl.uniform4f(mLoc.uPointer, this.pointer.x, this.pointer.y, this.pointer.active, pulseAge);
    gl.uniform1i(mLoc.uHoloTiltEnabled, this.holoTiltEnabled ? 1 : 0);
    gl.uniform1f(mLoc.uTime, elapsedSec);
    gl.uniform1f(mLoc.uAsciiCount, this.asciiCharCount);
    gl.uniform1fv(mLoc.uToggles, this.uniformToggles);
    gl.uniform1fv(mLoc.uIntensities, this.uniformIntensities);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.pingPong = 1 - this.pingPong;
  }
}


// Native Android APK & Offline Browser Media Export Helper
const saveMediaOffline = (urlOrDataUrl, filename, mimeType = 'image/jpeg', onDone = null) => {
  const win = typeof window !== 'undefined' ? window : null;
  if (win && win.KiroshiNative && typeof win.KiroshiNative.saveBase64Media === 'function') {
    if (urlOrDataUrl.startsWith('data:')) {
      try {
        win.KiroshiNative.saveBase64Media(urlOrDataUrl, filename, mimeType);
        if (onDone) onDone('SAVED TO DOWNLOADS/KIROSHI');
        return;
      } catch (err) {
        console.error('Native save error:', err);
      }
    } else if (urlOrDataUrl.startsWith('blob:')) {
      fetch(urlOrDataUrl)
        .then((r) => r.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              win.KiroshiNative.saveBase64Media(reader.result, filename, blob.type || mimeType);
              if (onDone) onDone('BD SAVED TO DOWNLOADS/KIROSHI');
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch((err) => console.error('Blob read error:', err));
      return;
    }
  }
  const a = document.createElement('a');
  a.href = urlOrDataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (onDone) onDone(null);
};

// ============================================================================
// PART 2: CYBERPUNK 2077 NETRUNNER // KIROSHI OPTICS FULLSCREEN UI LAYER
// ============================================================================

const ICON_MAP = {
  trails: Wind, thermal: Activity, scanlines: AlignJustify, crt: Tv,
  glitch: Zap, artifact: Cpu, smear: Droplets, mosh: Layers,
  kaleidoscope: Aperture, vhs: Film, anaglyph: Glasses, slowMo: Clock,
  pixel: Grid, edge: Scan, glow: Sun, nvg: Eye,
  invert: Contrast, rgbSplit: Layout, posterize: Palette, dither: MoreHorizontal,
  ascii: Hash, fontslop: Type, warp: Waves
};

const LENS_AESTHETICS = {
  trails:       { hex: '0x7F_TRL', tag: 'CHRONO_ECHO',   motif: 'trails',    grad: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 55%, #FF003C 100%)', border: '#00F0FF', glow: 'rgba(0,240,255,0.65)' },
  thermal:      { hex: '0x9A_THM', tag: 'IR_THERMO',     motif: 'thermal',   grad: 'linear-gradient(135deg, #1A0033 0%, #FF003C 45%, #FCEE0A 100%)', border: '#FF003C', glow: 'rgba(255,0,60,0.7)' },
  scanlines:    { hex: '0x2C_SCN', tag: 'RASTER_SYNC',   motif: 'scanlines', grad: 'repeating-linear-gradient(0deg, #051A14 0px, #051A14 3px, #00FF66 3px, #00FF66 5px)', border: '#00FF66', glow: 'rgba(0,255,102,0.6)' },
  crt:          { hex: '0x4E_CRT', tag: 'CATHODE_WARP',  motif: 'crt',       grad: 'radial-gradient(circle at center, #3A2E00 0%, #0A0A0F 85%)', border: '#FCEE0A', glow: 'rgba(252,238,10,0.65)' },
  glitch:       { hex: '0xE1_GLT', tag: 'ICE_BREACH',    motif: 'glitch',    grad: 'linear-gradient(90deg, #FF003C 0%, #09090D 25%, #00F0FF 50%, #09090D 75%, #FCEE0A 100%)', border: '#FF003C', glow: 'rgba(255,0,60,0.75)' },
  artifact:     { hex: '0x8B_ART', tag: 'VRAM_CORRUPT',  motif: 'grid',      grad: 'linear-gradient(135deg, #003830 0%, #00F5D4 100%)', border: '#00F5D4', glow: 'rgba(0,245,212,0.65)' },
  smear:        { hex: '0x3D_SMR', tag: 'OPTIC_DRIFT',   motif: 'waves',     grad: 'linear-gradient(105deg, #FF6B00 0%, #4A1500 60%, #FF0055 100%)', border: '#FF6B00', glow: 'rgba(255,107,0,0.65)' },
  mosh:         { hex: '0x5F_MSH', tag: 'IFRAME_DROP',   motif: 'glitch',    grad: 'linear-gradient(135deg, #2E0854 0%, #C084FC 55%, #00F0FF 100%)', border: '#C084FC', glow: 'rgba(192,132,252,0.65)' },
  kaleidoscope: { hex: '0x6A_KLD', tag: 'PRISM_ARRAY',   motif: 'prism',     grad: 'conic-gradient(from 45deg at 50% 50%, #FF003C, #FCEE0A, #00F0FF, #C084FC, #FF003C)', border: '#F43F5E', glow: 'rgba(244,63,94,0.7)' },
  vhs:          { hex: '0x19_VHS', tag: 'MAG_TAPE_88',   motif: 'scanlines', grad: 'linear-gradient(180deg, #002845 0%, #09090D 50%, #FF0055 100%)', border: '#38BDF8', glow: 'rgba(56,189,248,0.65)' },
  anaglyph:     { hex: '0x33_3DX', tag: 'STEREO_SPLIT',  motif: 'rgb',       grad: 'linear-gradient(90deg, #FF003C 0%, #0A0A0F 50%, #00F0FF 100%)', border: '#00F0FF', glow: 'rgba(0,240,255,0.7)' },
  slowMo:       { hex: '0x08_SLW', tag: 'KERENZIKOV',    motif: 'trails',    grad: 'linear-gradient(135deg, #3D3500 0%, #FCEE0A 100%)', border: '#FCEE0A', glow: 'rgba(252,238,10,0.7)' },
  pixel:        { hex: '0x44_PXL', tag: 'VOXEL_DECIM',   motif: 'grid',      grad: 'linear-gradient(135deg, #052E16 0%, #4ADE80 100%)', border: '#4ADE80', glow: 'rgba(74,222,128,0.65)' },
  edge:         { hex: '0x71_EDG', tag: 'SOBEL_WIRE',    motif: 'wire',      grad: 'linear-gradient(135deg, #000000 0%, #042F2E 60%, #2DD4BF 100%)', border: '#2DD4BF', glow: 'rgba(45,212,191,0.7)' },
  glow:         { hex: '0x99_GLW', tag: 'NEON_BLOOM',    motif: 'radial',    grad: 'radial-gradient(circle at center, #FCEE0A 0%, #FF6B00 45%, #180A00 100%)', border: '#FBBF24', glow: 'rgba(251,191,36,0.75)' },
  nvg:          { hex: '0x52_NVG', tag: 'MILITECH_NV',   motif: 'nvg',       grad: 'radial-gradient(circle at center, #1A4D00 0%, #051400 75%, #000000 100%)', border: '#84CC16', glow: 'rgba(132,204,22,0.7)' },
  invert:       { hex: '0xFF_INV', tag: 'PHASE_FLIP',    motif: 'invert',    grad: 'linear-gradient(135deg, #FFFFFF 0%, #09090D 50%, #E879F9 100%)', border: '#E879F9', glow: 'rgba(232,121,249,0.65)' },
  rgbSplit:     { hex: '0xB4_RGB', tag: 'CHROMA_SHIFT',  motif: 'rgb',       grad: 'linear-gradient(120deg, #FF003C 0%, #00FF66 50%, #00F0FF 100%)', border: '#FB7185', glow: 'rgba(251,113,133,0.7)' },
  posterize:    { hex: '0x6C_PST', tag: 'BAND_CLAMP',    motif: 'poster',    grad: 'linear-gradient(90deg, #431407 0%, #431407 33%, #9A3412 33%, #9A3412 66%, #FB923C 66%, #FB923C 100%)', border: '#FB923C', glow: 'rgba(251,146,60,0.65)' },
  dither:       { hex: '0x1D_DTH', tag: 'BAYER_4X4',     motif: 'dither',    grad: 'radial-gradient(#A78BFA 1.5px, #1E1035 1.5px)', border: '#A78BFA', glow: 'rgba(167,139,250,0.65)' },
  ascii:        { hex: '0xA0_ASC', tag: 'NET_GLYPH',     motif: 'ascii',     grad: 'linear-gradient(180deg, #022C22 0%, #000000 100%)', border: '#34D399', glow: 'rgba(52,211,153,0.7)' },
  fontslop:     { hex: '0xF0_SLP', tag: 'BLACKWALL_TXT', motif: 'ascii',     grad: 'linear-gradient(135deg, #500724 0%, #09090D 55%, #F472B6 100%)', border: '#F472B6', glow: 'rgba(244,114,182,0.7)' },
  warp:         { hex: '0xC8_WRP', tag: 'SINE_DISTORT',  motif: 'waves',     grad: 'linear-gradient(135deg, #0C1938 0%, #1D4ED8 50%, #60A5FA 100%)', border: '#60A5FA', glow: 'rgba(96,165,250,0.7)' }
};

const ASPECT_OPTIONS = [
  { id: 'FULL', label: 'FULL_OPTIC', ratio: null },
  { id: '4:3',  label: '4:3_STD',    ratio: 4 / 3 },
  { id: '1:1',  label: '1:1_SYNC',   ratio: 1 },
  { id: '16:9', label: '16:9_WIDE',  ratio: 16 / 9 }
];

const CLIP_CARD = 'polygon(0 10px, 10px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 14px 100%, 0 calc(100% - 14px))';
const CLIP_SIDE = 'polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)';
const CLIP_BTN  = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))';

export default function App() {
  const engineRef = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const objectUrlRef = useRef(null);
  const synthCanvasRef = useRef(null);
  const synthRafRef = useRef(null);
  const scopeCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [fxState, setFxState] = useState({
    toggles: DEFAULT_TOGGLES,
    intensities: DEFAULT_INTENSITIES,
    palette: 'CLASSIC',
    asciiSet: 'CLASSIC'
  });
  const [focusedIndex, setFocusedIndex] = useState(1);
  const [activePreset, setActivePreset] = useState('NONE');
  const [aspectIdx, setAspectIdx] = useState(0);

  const [mediaType, setMediaType] = useState('camera');
  const [facingMode, setFacingMode] = useState('environment');
  const [toastMsg, setToastMsg] = useState('');
  const [isStealth, setIsStealth] = useState(false);
  const [showReticle, setShowReticle] = useState(true);
  const [showScope, setShowScope] = useState(true);
  const [hqExport, setHqExport] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [arMeshActive, setArMeshActive] = useState(false);
  const [holoTiltActive, setHoloTiltActive] = useState(false);
  const [touchShockwave, setTouchShockwave] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [panZoom, setPanZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [shutterFlash, setShutterFlash] = useState(false);
  const [capturedShards, setCapturedShards] = useState([]);
  const [savedUserSlots, setSavedUserSlots] = useState(() => {
    try {
      const raw = localStorage.getItem('kiroshi_user_slots_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 3) return parsed;
      }
    } catch {}
    return [null, null, null];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kiroshi_user_slots_v1', JSON.stringify(savedUserSlots));
    } catch {}
  }, [savedUserSlots]);

  const toastTimerRef = useRef(null);
  const carouselTouchX = useRef(null);
  const gestureRef = useRef({
    isPanning: false, startX: 0, startY: 0, initialX: 0, initialY: 0, initialDist: 0, initialScale: 1
  });

  const totalLenses = FX_REGISTRY.length;
  const prevIndex = (focusedIndex - 1 + totalLenses) % totalLenses;
  const nextIndex = (focusedIndex + 1) % totalLenses;

  const centerLens = FX_REGISTRY[focusedIndex];
  const prevLens = FX_REGISTRY[prevIndex];
  const nextLens = FX_REGISTRY[nextIndex];

  const centerStyle = LENS_AESTHETICS[centerLens.id] || LENS_AESTHETICS.thermal;
  const isCenterActive = fxState.toggles[centerLens.id];
  const activeCount = Object.values(fxState.toggles).filter(Boolean).length;
  const currentAspect = ASPECT_OPTIONS[aspectIdx];

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 1800);
  }, []);

  const syncEngineConfig = useCallback((partial) => {
    if (!engineRef.current) return;
    const updated = engineRef.current.updateConfig(partial);
    setFxState(updated);
  }, []);

  const stopSynthSignal = useCallback(() => {
    if (synthRafRef.current) {
      cancelAnimationFrame(synthRafRef.current);
      synthRafRef.current = null;
    }
  }, []);

  const startSynthSignal = useCallback(() => {
    stopSynthSignal();
    setMediaType('synth');
    let c = synthCanvasRef.current;
    if (!c) {
      c = document.createElement('canvas');
      c.width = 720;
      c.height = 960;
      synthCanvasRef.current = c;
    }
    const ctx = c.getContext('2d');

    const renderSynth = (t) => {
      synthRafRef.current = requestAnimationFrame(renderSynth);
      const sec = t * 0.001;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, 520);
      skyGrad.addColorStop(0, '#070510');
      skyGrad.addColorStop(0.6, '#1A0826');
      skyGrad.addColorStop(1, '#FF003C');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 720, 520);

      const sunY = 340 + Math.sin(sec * 1.2) * 25;
      const sunGrad = ctx.createLinearGradient(0, sunY - 130, 0, sunY + 130);
      sunGrad.addColorStop(0, '#FCEE0A');
      sunGrad.addColorStop(0.5, '#FF003C');
      sunGrad.addColorStop(1, '#7000FF');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(360, sunY, 130, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#14061F';
      for (let i = 0; i < 7; i++) {
        const y = sunY + 10 + i * 18;
        ctx.fillRect(220, y, 280, 4 + i * 1.5);
      }

      ctx.fillStyle = '#06060C';
      ctx.fillRect(0, 520, 720, 440);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;

      for (let x = -500; x <= 1220; x += 80) {
        ctx.beginPath();
        ctx.moveTo(360 + (x - 360) * 0.18, 520);
        ctx.lineTo(x + ((sec * 95) % 80), 960);
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const p = ((i / 12) + (sec * 0.25)) % 1;
        const y = 520 + Math.pow(p, 2.2) * 440;
        ctx.strokeStyle = i % 2 === 0 ? '#00F0FF' : '#FF003C';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(720, y);
        ctx.stroke();
      }
    };

    synthRafRef.current = requestAnimationFrame(renderSynth);
    engineRef.current?.setSource(c, 'video', false);
  }, [stopSynthSignal]);

  useEffect(() => {
    const engine = new FXEngine({ maxResolution: 840, minFrameInterval: 16 });
    engineRef.current = engine;
    if (canvasRef.current) engine.setTarget(canvasRef.current);
    engine.setAspectRatio(null);
    engine.start();
    return () => {
      stopSynthSignal();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      engine.destroy();
    };
  }, [stopSynthSignal]);

  // Live RGB / Luma Optical Oscilloscope HUD Renderer
  useEffect(() => {
    if (!showScope || isStealth) return;
    const interval = setInterval(() => {
      const c = scopeCanvasRef.current;
      const metrics = engineRef.current?.sampleScopeMetrics();
      if (!c || !metrics) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;
      ctx.clearRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.stroke();

      const drawWave = (bins, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < bins.length; i++) {
          const x = (i / (bins.length - 1)) * w;
          const y = h - (bins[i] / 255) * (h - 4) - 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      ctx.globalCompositeOperation = 'screen';
      drawWave(metrics.rBins, '#FF003C');
      drawWave(metrics.gBins, '#00FF66');
      drawWave(metrics.bBins, '#00F0FF');
      ctx.globalCompositeOperation = 'source-over';
    }, 90);
    return () => clearInterval(interval);
  }, [showScope, isStealth]);

  // Keyboard Navigation Shortcuts (Left/Right: Cycle Lenses, Space: Toggle Lens, Enter: Snap)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (activeModal) {
        if (e.key === 'Escape') setActiveModal(null);
        return;
      }
      if (e.key === 'ArrowLeft') {
        setFocusedIndex((p) => (p - 1 + totalLenses) % totalLenses);
      } else if (e.key === 'ArrowRight') {
        setFocusedIndex((p) => (p + 1) % totalLenses);
      } else if (e.key === ' ') {
        e.preventDefault();
        const lens = FX_REGISTRY[focusedIndex];
        syncEngineConfig({ toggles: { [lens.id]: !fxState.toggles[lens.id] } });
        setActivePreset('CUSTOM');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, focusedIndex, totalLenses, fxState.toggles, syncEngineConfig]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (mode) => {
    stopCamera();
    stopSynthSignal();
    if (!navigator.mediaDevices?.getUserMedia) {
      startSynthSignal();
      showToast('SIM_FEED // NIGHT_CITY');
      return;
    }

    // Brief hardware release pause for mobile browsers switching between rear/front sensors
    await new Promise((r) => setTimeout(r, 60));

    let stream = null;
    const constraintAttempts = [
      { video: { facingMode: { exact: mode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: mode }, audio: false }
    ];

    for (const constraints of constraintAttempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch {
        // Continue to next relaxed constraint
      }
    }

    // Fallback: Enumerate videoinput devices and match front/back label or pick available camera
    if (!stream && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 0) {
          const targetKeyword = mode === 'user' ? /front|user|facetime|inner/i : /back|rear|environment|outer/i;
          const matched =
            videoDevices.find((d) => targetKeyword.test(d.label)) ||
            (mode === 'user' ? videoDevices[videoDevices.length - 1] : videoDevices[0]);
          if (matched?.deviceId) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: matched.deviceId } },
              audio: false
            });
          }
        }
      } catch {
        // Fallback to generic video request below
      }
    }

    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch {
        startSynthSignal();
        showToast('OPTIC_SIM // ACTIVE');
        return;
      }
    }

    if (videoRef.current && stream) {
      const vid = videoRef.current;
      setMediaType('camera');
      vid.removeAttribute('src');
      vid.srcObject = stream;

      // Detect whether the active track is a front/user camera for proper mirroring
      const trackSettings = stream.getVideoTracks()[0]?.getSettings?.() || {};
      const isFront =
        trackSettings.facingMode === 'user' ||
        (trackSettings.facingMode === undefined && mode === 'user');

      const activateVideoSource = async () => {
        try {
          await vid.play();
        } catch {
          // Ignore autoplay interruption if already playing
        }
        engineRef.current?.setSource(vid, 'camera', isFront);
      };

      vid.onloadedmetadata = activateVideoSource;
      if (vid.readyState >= 1) {
        activateVideoSource();
      }
    }
  }, [stopCamera, stopSynthSignal, startSynthSignal, showToast]);

  const handleFlipCamera = useCallback(() => {
    const nextMode = mediaType !== 'camera' ? facingMode : (facingMode === 'user' ? 'environment' : 'user');
    showToast(nextMode === 'user' ? 'OPTIC // INNER_FRONT_CAM' : 'OPTIC // OUTER_REAR_CAM');
    if (nextMode === facingMode) {
      startCamera(nextMode);
    } else {
      setFacingMode(nextMode);
    }
  }, [mediaType, facingMode, startCamera, showToast]);

  useEffect(() => {
    startCamera(facingMode);
    const onNativeCamGranted = () => startCamera(facingMode);
    window.addEventListener('kiroshi-camera-granted', onNativeCamGranted);
    return () => {
      window.removeEventListener('kiroshi-camera-granted', onNativeCamGranted);
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  useEffect(() => {
    const handleOrientation = (e) => {
      const gX = (e.gamma || 0) / 45;
      const gY = ((e.beta || 45) - 45) / 45;
      engineRef.current?.setGyro(gX, gY);
    };
    if (gyroEnabled) window.addEventListener('deviceorientation', handleOrientation);
    else engineRef.current?.setGyro(0, 0);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gyroEnabled]);

  const toggleGyro = async () => {
    if (!gyroEnabled && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') return showToast('GYRO_LINK_DENIED');
      } catch {
        return showToast('GYRO_FAULT');
      }
    }
    setGyroEnabled((prev) => {
      showToast(!prev ? 'GYRO_SYNC // ONLINE' : 'GYRO_SYNC // OFFLINE');
      return !prev;
    });
  };

  const toggleArMesh = () => {
    setArMeshActive((prev) => {
      const next = !prev;
      engineRef.current?.setArMesh(next);
      showToast(next ? 'AR_MESH // HOLOGRAPHIC 3D' : 'AR_MESH // OFFLINE');
      return next;
    });
  };

  const toggleHoloTilt = () => {
    setHoloTiltActive((prev) => {
      const next = !prev;
      engineRef.current?.setHoloTilt(next);
      showToast(next ? '3D_TOPO // WIREFRAME RELIEF' : '3D_TOPO // FLAT_OPTIC');
      return next;
    });
  };

  const cycleAspect = () => {
    const next = (aspectIdx + 1) % ASPECT_OPTIONS.length;
    setAspectIdx(next);
    engineRef.current?.setAspectRatio(ASPECT_OPTIONS[next].ratio);
    setPanZoom({ scale: 1, x: 0, y: 0 });
    showToast(`OPTIC_FRAME // ${ASPECT_OPTIONS[next].label}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    stopSynthSignal();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    e.target.value = ''; // Reset so re-uploading the same file triggers onChange

    if (file.type.startsWith('image/')) {
      setMediaType('image');
      if (imageRef.current) {
        imageRef.current.onload = () => engineRef.current?.setSource(imageRef.current, 'image', false);
        imageRef.current.src = url;
      }
      showToast('SHARD_LOADED // IMG');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.loop = true;
        videoRef.current.onloadeddata = () => {
          videoRef.current.play();
          engineRef.current?.setSource(videoRef.current, 'video', false);
        };
      }
      showToast('BRAINDANCE_LOADED');
    }
  };

  const updatePointerShockwave = (clientX, clientY, isPressed, triggerPulse) => {
    if (!touchShockwave || !canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (clientX - rect.left) / rect.width;
    const normY = 1.0 - (clientY - rect.top) / rect.height;
    engineRef.current.setPointer(normX, normY, isPressed, triggerPulse);
  };

  const handleWheel = (e) => {
    const delta = -e.deltaY * 0.002;
    setPanZoom((p) => ({ ...p, scale: Math.min(5, Math.max(1, p.scale + delta)) }));
  };

  const handleMouseDown = (e) => {
    updatePointerShockwave(e.clientX, e.clientY, true, true);
    gestureRef.current = {
      ...gestureRef.current,
      isPanning: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: panZoom.x,
      initialY: panZoom.y
    };
  };

  const handleMouseMove = (e) => {
    if (gestureRef.current.isPanning) {
      updatePointerShockwave(e.clientX, e.clientY, true, false);
    }
    if (!gestureRef.current.isPanning || panZoom.scale <= 1) return;
    const dx = e.clientX - gestureRef.current.startX;
    const dy = e.clientY - gestureRef.current.startY;
    setPanZoom((p) => ({ ...p, x: gestureRef.current.initialX + dx, y: gestureRef.current.initialY + dy }));
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      gestureRef.current.initialDist = dist;
      gestureRef.current.initialScale = panZoom.scale;
    } else if (e.touches.length === 1) {
      updatePointerShockwave(e.touches[0].clientX, e.touches[0].clientY, true, true);
      gestureRef.current = {
        ...gestureRef.current,
        isPanning: true,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initialX: panZoom.x,
        initialY: panZoom.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && gestureRef.current.initialDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(5, Math.max(1, gestureRef.current.initialScale * (dist / gestureRef.current.initialDist)));
      setPanZoom((p) => ({ ...p, scale: newScale }));
    } else if (e.touches.length === 1 && gestureRef.current.isPanning) {
      updatePointerShockwave(e.touches[0].clientX, e.touches[0].clientY, true, false);
      if (panZoom.scale > 1) {
        const dx = e.touches[0].clientX - gestureRef.current.startX;
        const dy = e.touches[0].clientY - gestureRef.current.startY;
        setPanZoom((p) => ({ ...p, x: gestureRef.current.initialX + dx, y: gestureRef.current.initialY + dy }));
      }
    }
  };

  const handleTouchEnd = () => {
    gestureRef.current.isPanning = false;
    gestureRef.current.initialDist = 0;
    engineRef.current?.setPointer(0.5, 0.5, false, false);
  };

  const stepCarousel = useCallback((dir) => {
    setFocusedIndex((prev) => (prev + dir + totalLenses) % totalLenses);
  }, [totalLenses]);

  const handleCarouselTouchStart = (e) => {
    e.stopPropagation();
    carouselTouchX.current = e.touches[0].clientX;
  };

  const handleCarouselTouchEnd = (e) => {
    e.stopPropagation();
    if (carouselTouchX.current === null) return;
    const dx = e.changedTouches[0].clientX - carouselTouchX.current;
    if (dx > 30) stepCarousel(-1);
    else if (dx < -30) stepCarousel(1);
    carouselTouchX.current = null;
  };

  const handleSnapshot = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 140);

    const dataUrl = engineRef.current?.exportFrame(hqExport);
    if (!dataUrl) return;

    // Store in internal Shard Vault + download
    setCapturedShards((prev) => [
      {
        id: Date.now(),
        type: 'IMG',
        url: dataUrl,
        preset: activePreset,
        time: new Date().toLocaleTimeString([], { hour12: false })
      },
      ...prev.slice(0, 11)
    ]);

    saveMediaOffline(
      dataUrl,
      `KIROSHI_OPTIC_${Date.now()}.jpg`,
      'image/jpeg',
      (nativeMsg) => showToast(nativeMsg || 'SHARD_ARCHIVED & SAVED')
    );
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      showToast('BD_RECORDING_SAVED');
    } else if (canvasRef.current) {
      try {
        recordedChunksRef.current = [];
        const stream = canvasRef.current.captureStream(30);
        const candidates = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ];
        const mimeType = candidates.find((m) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(m)) || '';
        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
          const url = URL.createObjectURL(blob);
          setCapturedShards((prev) => [
            {
              id: Date.now(),
              type: 'BD_VID',
              url,
              preset: activePreset,
              time: new Date().toLocaleTimeString([], { hour12: false })
            },
            ...prev.slice(0, 11)
          ]);
          saveMediaOffline(
            url,
            `KIROSHI_BD_${Date.now()}.${ext}`,
            mimeType || 'video/webm',
            (nativeMsg) => { if (nativeMsg) showToast(nativeMsg); }
          );
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        showToast('BRAINDANCE_REC // LIVE');
      } catch {
        showToast('REC_UNSUPPORTED_BROWSER');
      }
    }
  };

  const triggerOverclockChaos = () => {
    const randToggles = {};
    const randInt = {};
    let pickedIdx = focusedIndex;
    FX_REGISTRY.forEach((f, idx) => {
      const on = Math.random() > 0.76;
      randToggles[f.id] = on;
      randInt[f.id] = Math.floor(Math.random() * 85) + 15;
      if (on) pickedIdx = idx;
    });
    const pal = THERMAL_PALETTES[Math.floor(Math.random() * THERMAL_PALETTES.length)];
    syncEngineConfig({ toggles: randToggles, intensities: randInt, palette: pal });
    setFocusedIndex(pickedIdx);
    setActivePreset('OVERCLOCK');
    showToast('DAEMON_OVERCLOCK!');
  };

  const purgeAllDaemons = () => {
    setFxState(engineRef.current.applyPreset('NONE'));
    setActivePreset('NONE');
    showToast('DAEMONS_PURGED');
  };

  const renderCenterLensMotif = (motif, color) => {
    switch (motif) {
      case 'thermal':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-45">
            <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,#FCEE0A_0%,#FF003C_45%,#3B0764_95%)]" />
            <div className="absolute inset-2 border border-dashed border-[#FCEE0A]/60 rounded-full" />
          </div>
        );
      case 'ascii':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 flex flex-wrap text-[8px] leading-[9px] font-mono text-[#00FF66] p-1 break-all">
            01ｦｱｳｴｵｶｷｸｹｺ10ⰀⰁⰂⰃⰄ0110ｦｱｳｴｵｶｷｸｹｺ10ⰅⰆⰇⰈ
          </div>
        );
      case 'glitch':
        return (
          <div className="absolute inset-0 pointer-events-none opacity-45">
            <div className="absolute top-2 inset-x-0 h-1.5 bg-[#00F0FF] translate-x-2" />
            <div className="absolute bottom-3 inset-x-0 h-2 bg-[#FF003C] -translate-x-3" />
            <div className="absolute top-1/2 inset-x-0 h-0.5 bg-[#FCEE0A]" />
          </div>
        );
      case 'prism':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            <div className="w-24 h-24 rounded-full border-2 border-[#00F0FF] rotate-45" />
            <div className="absolute w-16 h-16 border-2 border-[#FCEE0A] rotate-12" />
            <div className="absolute w-16 h-16 border-2 border-[#FF003C] -rotate-12" />
          </div>
        );
      case 'rgb':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
            <div className="w-14 h-14 rounded-full bg-[#FF003C] mix-blend-screen -translate-x-3" />
            <div className="w-14 h-14 rounded-full bg-[#00FF66] mix-blend-screen" />
            <div className="w-14 h-14 rounded-full bg-[#00F0FF] mix-blend-screen translate-x-3" />
          </div>
        );
      case 'nvg':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
            <div className="w-20 h-20 rounded-full border border-[#84CC16] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-[#84CC16]" />
            </div>
          </div>
        );
      case 'grid':
      case 'dither':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
              backgroundSize: '8px 8px'
            }}
          />
        );
      default:
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0px, transparent 4px, rgba(255,255,255,0.25) 4px, rgba(255,255,255,0.25) 6px)'
            }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050508] text-[#00F0FF] font-mono overflow-hidden select-none touch-none">
      <video ref={videoRef} playsInline muted className="hidden" />
      <img ref={imageRef} alt="source" className="hidden" />
      <input type="file" ref={fileInputRef} accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />

      <div
        className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (isStealth) setIsStealth(false); }}
      >
        <canvas
          ref={canvasRef}
          className={` transition-all duration-200 pointer-events-none ${
            currentAspect.ratio === null
              ? 'w-full h-full object-cover'
              : 'max-w-full max-h-full object-contain border border-[#00F0FF]/40 shadow-[0_0_40px_rgba(0,240,255,0.15)]'
          }`}
          style={{
            transform: `translate(${panZoom.x}px, ${panZoom.y}px) scale(${panZoom.scale})`,
            transformOrigin: 'center'
          }}
        />

        {shutterFlash && <div className="absolute inset-0 bg-[#00F0FF] mix-blend-screen z-40 pointer-events-none" />}

        {showReticle && !isStealth && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-24 left-4 w-7 h-7 border-t-2 border-l-2 border-[#FCEE0A]/70" />
            <div className="absolute top-24 right-4 w-7 h-7 border-t-2 border-r-2 border-[#FCEE0A]/70" />
            <div className="absolute bottom-56 left-4 w-7 h-7 border-b-2 border-l-2 border-[#FCEE0A]/70" />
            <div className="absolute bottom-56 right-4 w-7 h-7 border-b-2 border-r-2 border-[#FCEE0A]/70" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#00F0FF]/25 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#FF003C] rounded-full shadow-[0_0_8px_#FF003C]" />
              <span className="absolute -bottom-4 text-[8px] tracking-widest text-[#00F0FF]/60">
                {panZoom.scale > 1 ? `ZOOM_${panZoom.scale.toFixed(1)}X` : 'LOCK_OK'}
              </span>
            </div>
          </div>
        )}

        {toastMsg && (
          <div
            style={{ clipPath: CLIP_BTN }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-[#FCEE0A] text-black px-5 py-1.5 border-l-4 border-[#FF003C] font-black text-xs tracking-widest shadow-[0_0_25px_rgba(252,238,10,0.6)] whitespace-nowrap"
          >
            // {toastMsg}
          </div>
        )}
      </div>

      {!isStealth && (
        <header className="absolute top-0 inset-x-0 z-30 p-3 pt-4 flex items-start justify-between pointer-events-none bg-gradient-to-b from-black/85 via-black/40 to-transparent pb-8">
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <div
              style={{ clipPath: CLIP_BTN }}
              className="bg-[#0A0A10]/90 border border-[#FF003C] px-3 py-1.5 flex items-center gap-2.5 shadow-[0_0_15px_rgba(255,0,60,0.25)]"
            >
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-[#FF003C] animate-ping' : 'bg-[#FCEE0A]'}`} />
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-black tracking-widest text-[#FCEE0A]">KIROSHI // MK.V</span>
                <span className="text-[8px] text-[#00F0FF] tracking-wider">
                  {mediaType.toUpperCase()} :: {activePreset}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-black/75 px-2 py-1 border-l-2 border-[#00F0FF]">
              <span className="text-[8px] font-bold text-[#00F0FF] mr-1">RAM</span>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2.5 transition-colors ${
                    idx < activeCount
                      ? 'bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
              <span className="text-[9px] font-black text-[#FCEE0A] ml-1">{activeCount}</span>
            </div>

            {panZoom.scale > 1 && (
              <button
                onClick={() => setPanZoom({ scale: 1, x: 0, y: 0 })}
                style={{ clipPath: CLIP_BTN }}
                className="bg-[#00F0FF] text-black px-2.5 py-1 text-[9px] font-black tracking-wider flex items-center gap-1 self-start"
              >
                <Focus size={11} /> RESET_OPTIC
              </button>
            )}

            {/* Live RGB / Luma Optical Oscilloscope HUD */}
            {showScope && (
              <div
                style={{ clipPath: CLIP_BTN }}
                className="bg-[#0A0A10]/85 border border-[#00F0FF]/50 p-1.5 flex flex-col gap-0.5 w-28 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center text-[7px] font-black tracking-widest text-[#00F0FF]">
                  <span>RGB_SCOPE</span>
                  <span className="text-[#FCEE0A]">LIVE</span>
                </div>
                <canvas ref={scopeCanvasRef} width={104} height={28} className="w-full h-7 bg-black/70" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end max-w-[235px] sm:max-w-none">
            {/* 3D Topographic Wireframe Tilt Toggle */}
            <button
              onClick={toggleHoloTilt}
              style={{ clipPath: CLIP_BTN }}
              className={`h-9 px-2.5 border text-[10px] font-black tracking-wider flex items-center gap-1 ${
                holoTiltActive ? 'bg-[#FCEE0A] text-black border-[#FCEE0A] shadow-[0_0_12px_#FCEE0A]' : 'bg-[#0A0A10]/90 text-[#FCEE0A] border-[#FCEE0A]/70'
              }`}
              title="Toggle 3D Topographic Wireframe Projection"
            >
              <Box size={13} />
              <span>3D</span>
            </button>

            {/* AR Hologram Toggle */}
            <button
              onClick={toggleArMesh}
              style={{ clipPath: CLIP_BTN }}
              className={`h-9 px-2.5 border text-[10px] font-black tracking-wider flex items-center gap-1 ${
                arMeshActive ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_#00F0FF]' : 'bg-[#0A0A10]/90 text-[#00F0FF] border-[#00F0FF]/70'
              }`}
              title="Toggle AR Hologram 3D Mesh"
            >
              <Sparkles size={13} />
              <span>AR</span>
            </button>

            {/* Captured Shards Vault Button */}
            {capturedShards.length > 0 && (
              <button
                onClick={() => setActiveModal(activeModal === 'vault' ? null : 'vault')}
                style={{ clipPath: CLIP_BTN }}
                className="h-9 px-2.5 bg-[#FF003C] text-white border border-white/60 text-[10px] font-black tracking-wider flex items-center gap-1 shadow-[0_0_12px_#FF003C]"
                title="Open Captured Shard Vault"
              >
                <ImageIcon size={13} />
                <span>{capturedShards.length}</span>
              </button>
            )}

            <button
              onClick={cycleAspect}
              style={{ clipPath: CLIP_BTN }}
              className="h-9 px-2.5 bg-[#0A0A10]/90 border border-[#00F0FF]/70 text-[#00F0FF] text-[10px] font-black tracking-wider flex items-center gap-1 active:bg-[#00F0FF] active:text-black"
            >
              <Maximize2 size={13} />
              <span>{currentAspect.id}</span>
            </button>

            <button
              onClick={handleFlipCamera}
              style={{ clipPath: CLIP_BTN }}
              className={`h-9 px-2.5 border flex items-center gap-1 text-[10px] font-black tracking-wider active:bg-[#FCEE0A] active:text-black ${
                mediaType === 'camera' && facingMode === 'user'
                  ? 'bg-[#FCEE0A] text-black border-[#FCEE0A] shadow-[0_0_10px_#FCEE0A]'
                  : 'bg-[#0A0A10]/90 border-[#FCEE0A]/80 text-[#FCEE0A]'
              }`}
              title="Switch Inner / Outer Camera"
            >
              <RefreshCcw size={14} />
              <span>{facingMode === 'user' ? 'INNER' : 'OUTER'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ clipPath: CLIP_BTN }}
              className="w-9 h-9 bg-[#0A0A10]/90 border border-[#00FF66]/80 text-[#00FF66] flex items-center justify-center active:bg-[#00FF66] active:text-black"
              title="Load External Media Shard"
            >
              <Upload size={15} />
            </button>

            <button
              onClick={() => {
                setIsStealth(true);
                showToast('STEALTH_HUD // TAP TO EXIT');
              }}
              style={{ clipPath: CLIP_BTN }}
              className="w-9 h-9 bg-[#0A0A10]/90 border border-zinc-500 text-zinc-300 flex items-center justify-center"
              title="Hide HUD Overlay"
            >
              <EyeOff size={15} />
            </button>

            <button
              onClick={() => setActiveModal(activeModal === 'settings' ? null : 'settings')}
              style={{ clipPath: CLIP_BTN }}
              className={`w-9 h-9 border flex items-center justify-center ${
                activeModal === 'settings'
                  ? 'bg-[#FF003C] border-[#FF003C] text-white'
                  : 'bg-[#0A0A10]/90 border-[#FF003C]/80 text-[#FF003C]'
              }`}
              title="System Config"
            >
              <Settings size={15} />
            </button>
          </div>
        </header>
      )}

      {!isStealth && (
        <div className="absolute bottom-0 inset-x-0 z-30 flex flex-col justify-end pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-5 px-3 gap-2.5">
          <div
            style={{ clipPath: CLIP_BTN }}
            className="pointer-events-auto max-w-md w-full mx-auto bg-[#0A0A10]/90 border border-zinc-800 border-l-4 px-3 py-2 flex flex-col gap-2 backdrop-blur-md"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#FCEE0A] text-black">
                  {centerStyle.hex}
                </span>
                <span className="text-[10px] font-black tracking-wider text-white">
                  {centerStyle.tag}
                </span>
              </div>

              <span
                className="text-xs font-black tracking-widest ml-auto"
                style={{ color: centerStyle.border }}
              >
                {fxState.intensities[centerLens.id]}%
              </span>
            </div>

            {centerLens.id === 'thermal' && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 border-y border-zinc-800/80">
                <span className="text-[8px] font-black text-[#FCEE0A] shrink-0 mr-1">PALETTE:</span>
                {THERMAL_PALETTES.map((pal) => (
                  <button
                    key={pal}
                    onClick={() => syncEngineConfig({ palette: pal, toggles: { thermal: true } })}
                    className={`px-2 py-0.5 text-[8px] font-black border shrink-0 transition-colors ${
                      fxState.palette === pal
                        ? 'bg-[#FCEE0A] text-black border-[#FCEE0A]'
                        : 'bg-black/80 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {pal}
                  </button>
                ))}
              </div>
            )}

            {(centerLens.id === 'ascii' || centerLens.id === 'fontslop') && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 border-y border-zinc-800/80">
                <span className="text-[8px] font-black text-[#00FF66] shrink-0 mr-1">GLYPHS:</span>
                {Object.keys(ASCII_SETS).map((setKey) => (
                  <button
                    key={setKey}
                    onClick={() => syncEngineConfig({ asciiSet: setKey, toggles: { [centerLens.id]: true } })}
                    className={`px-2 py-0.5 text-[8px] font-black border shrink-0 transition-colors ${
                      fxState.asciiSet === setKey
                        ? 'bg-[#00FF66] text-black border-[#00FF66]'
                        : 'bg-black/80 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {setKey}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-zinc-500 w-7">MIN</span>
              <input
                type="range"
                min="1"
                max="100"
                value={fxState.intensities[centerLens.id] || 50}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  syncEngineConfig({
                    toggles: { [centerLens.id]: true },
                    intensities: { [centerLens.id]: val }
                  });
                  setActivePreset('CUSTOM');
                }}
                className="flex-1 h-2 bg-zinc-900 appearance-none cursor-pointer rounded-none"
                style={{ accentColor: centerStyle.border }}
              />
              <span className="text-[8px] font-black text-zinc-500 w-7 text-right">MAX</span>
            </div>
          </div>

          <div
            className="pointer-events-auto max-w-md w-full mx-auto flex items-center justify-center gap-2.5 py-1"
            onTouchStart={handleCarouselTouchStart}
            onTouchEnd={handleCarouselTouchEnd}
          >
            {(() => {
              const PrevIcon = ICON_MAP[prevLens.id] || Zap;
              const prevActive = fxState.toggles[prevLens.id];
              const prevAes = LENS_AESTHETICS[prevLens.id] || LENS_AESTHETICS.thermal;
              return (
                <button
                  onClick={() => stepCarousel(-1)}
                  style={{
                    clipPath: CLIP_SIDE,
                    borderColor: prevActive ? prevAes.border : '#27272A'
                  }}
                  className="w-24 h-20 shrink-0 bg-[#0A0A10]/85 border-2 flex flex-col items-center justify-center p-2 opacity-65 hover:opacity-95 active:scale-95 transition-all relative overflow-hidden"
                >
                  <span className="text-[7px] text-zinc-500 tracking-widest mb-1">&lt; PREV</span>
                  <PrevIcon size={18} style={{ color: prevActive ? prevAes.border : '#A1A1AA' }} className="mb-1" />
                  <span className="text-[9px] font-black tracking-wider text-zinc-300 truncate w-full text-center">
                    {prevLens.label}
                  </span>
                  {prevActive && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: prevAes.border, boxShadow: `0 0 6px ${prevAes.border}` }}
                    />
                  )}
                </button>
              );
            })()}

            {(() => {
              const CenterIcon = ICON_MAP[centerLens.id] || Zap;
              return (
                <button
                  onClick={() => {
                    syncEngineConfig({ toggles: { [centerLens.id]: !isCenterActive } });
                    setActivePreset('CUSTOM');
                  }}
                  style={{
                    clipPath: CLIP_CARD,
                    background: centerStyle.grad,
                    borderColor: isCenterActive ? '#FCEE0A' : centerStyle.border,
                    boxShadow: isCenterActive
                      ? `0 0 28px ${centerStyle.glow}, inset 0 0 18px rgba(0,0,0,0.6)`
                      : `0 0 14px rgba(0,0,0,0.8), inset 0 0 24px rgba(0,0,0,0.75)`
                  }}
                  className="flex-1 max-w-[195px] h-24 relative border-2 flex flex-col justify-between p-2.5 transition-all duration-200 active:scale-95 overflow-hidden group"
                >
                  {renderCenterLensMotif(centerStyle.motif, centerStyle.border)}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="text-[8px] font-black tracking-widest text-white/90 bg-black/70 px-1.5 py-0.5 border-l-2 border-[#FCEE0A]">
                      {centerStyle.hex}
                    </span>
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 tracking-widest ${
                        isCenterActive
                          ? 'bg-[#FCEE0A] text-black shadow-[0_0_10px_#FCEE0A]'
                          : 'bg-black/80 text-zinc-300 border border-zinc-600'
                      }`}
                    >
                      {isCenterActive ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-center gap-2 my-auto">
                    <CenterIcon
                      size={26}
                      strokeWidth={2.5}
                      className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                    />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        {centerLens.label}
                      </span>
                      <span
                        className="text-[8px] font-bold tracking-widest"
                        style={{ color: centerStyle.border }}
                      >
                        {centerStyle.tag}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 w-full h-1.5 bg-black/80 overflow-hidden border border-white/20">
                    <div
                      className="h-full transition-all duration-150"
                      style={{
                        width: `${isCenterActive ? fxState.intensities[centerLens.id] : 0}%`,
                        backgroundColor: isCenterActive ? '#FCEE0A' : centerStyle.border
                      }}
                    />
                  </div>
                </button>
              );
            })()}

            {(() => {
              const NextIcon = ICON_MAP[nextLens.id] || Zap;
              const nextActive = fxState.toggles[nextLens.id];
              const nextAes = LENS_AESTHETICS[nextLens.id] || LENS_AESTHETICS.thermal;
              return (
                <button
                  onClick={() => stepCarousel(1)}
                  style={{
                    clipPath: CLIP_SIDE,
                    borderColor: nextActive ? nextAes.border : '#27272A'
                  }}
                  className="w-24 h-20 shrink-0 bg-[#0A0A10]/85 border-2 flex flex-col items-center justify-center p-2 opacity-65 hover:opacity-95 active:scale-95 transition-all relative overflow-hidden"
                >
                  <span className="text-[7px] text-zinc-500 tracking-widest mb-1">NEXT &gt;</span>
                  <NextIcon size={18} style={{ color: nextActive ? nextAes.border : '#A1A1AA' }} className="mb-1" />
                  <span className="text-[9px] font-black tracking-wider text-zinc-300 truncate w-full text-center">
                    {nextLens.label}
                  </span>
                  {nextActive && (
                    <span
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: nextAes.border, boxShadow: `0 0 6px ${nextAes.border}` }}
                    />
                  )}
                </button>
              );
            })()}
          </div>

          <div className="pointer-events-auto max-w-md w-full mx-auto grid grid-cols-5 items-center gap-2 pt-1">
            <button
              onClick={() => setActiveModal(activeModal === 'presets' ? null : 'presets')}
              style={{ clipPath: CLIP_BTN }}
              className="h-11 bg-[#0A0A10]/90 border border-[#FCEE0A]/80 text-[#FCEE0A] flex flex-col items-center justify-center active:bg-[#FCEE0A] active:text-black"
            >
              <Layers size={15} />
              <span className="text-[8px] font-black tracking-widest mt-0.5">BREACH</span>
            </button>

            <button
              onClick={() => setActiveModal(activeModal === 'matrix' ? null : 'matrix')}
              style={{ clipPath: CLIP_BTN }}
              className="h-11 bg-[#0A0A10]/90 border border-[#00F0FF]/80 text-[#00F0FF] flex flex-col items-center justify-center active:bg-[#00F0FF] active:text-black"
            >
              <Grid size={15} />
              <span className="text-[8px] font-black tracking-widest mt-0.5">DECK_23</span>
            </button>

            <div className="flex items-center justify-center">
              <button
                onClick={handleSnapshot}
                style={{ clipPath: CLIP_CARD }}
                className="w-16 h-14 bg-[#FCEE0A] border-2 border-[#FF003C] shadow-[0_0_20px_rgba(252,238,10,0.45)] active:scale-90 flex flex-col items-center justify-center text-black transition-transform"
                title="Capture Optic Frame"
              >
                <Camera size={22} strokeWidth={2.75} />
                <span className="text-[7px] font-black tracking-widest">SNAP</span>
              </button>
            </div>

            <button
              onClick={toggleRecording}
              style={{ clipPath: CLIP_BTN }}
              className={`h-11 border flex flex-col items-center justify-center ${
                isRecording
                  ? 'bg-[#FF003C] border-white text-white animate-pulse shadow-[0_0_15px_#FF003C]'
                  : 'bg-[#0A0A10]/90 border-[#FF003C]/80 text-[#FF003C]'
              }`}
            >
              <Video size={15} />
              <span className="text-[8px] font-black tracking-widest mt-0.5">
                {isRecording ? 'STOP_BD' : 'BD_REC'}
              </span>
            </button>

            <button
              onClick={activeCount > 0 ? purgeAllDaemons : triggerOverclockChaos}
              style={{ clipPath: CLIP_BTN }}
              className={`h-11 border flex flex-col items-center justify-center ${
                activeCount > 0
                  ? 'bg-[#0A0A10]/90 border-white/70 text-white'
                  : 'bg-[#0A0A10]/90 border-[#00FF66]/80 text-[#00FF66]'
              }`}
            >
              {activeCount > 0 ? <Ban size={15} /> : <Wand2 size={15} />}
              <span className="text-[8px] font-black tracking-widest mt-0.5">
                {activeCount > 0 ? 'PURGE' : 'CHAOS'}
              </span>
            </button>
          </div>
        </div>
      )}

      {activeModal && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-[#08080E]/95 backdrop-blur-xl border-t-2 border-[#FCEE0A] max-h-[80vh] flex flex-col pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between px-4 py-3 bg-[#12121C] border-b border-[#FF003C]/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-[#FCEE0A]" />
              <span className="text-xs font-black tracking-widest text-[#FCEE0A] uppercase">
                {activeModal === 'presets' && 'BREACH PROTOCOL // PRESET DAEMONS'}
                {activeModal === 'matrix' && 'CYBERDECK // ALL 23 OPTIC DAEMONS'}
                {activeModal === 'vault' && `SHARD VAULT // ${capturedShards.length} CAPTURED FRAMES`}
                {activeModal === 'settings' && 'KIROSHI_OS // SYSTEM CONFIG'}
              </span>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              style={{ clipPath: CLIP_BTN }}
              className="px-2.5 py-1 bg-[#FF003C] text-white text-xs font-black"
            >
              CLOSE [X]
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4">
            {activeModal === 'presets' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      purgeAllDaemons();
                      setActiveModal(null);
                    }}
                    style={{ clipPath: CLIP_BTN }}
                    className="p-2.5 bg-zinc-900 border border-zinc-600 text-zinc-200 text-[10px] font-black flex flex-col items-center gap-1"
                  >
                    <Ban size={15} /> PURGE_ALL
                  </button>
                  <button
                    onClick={() => {
                      triggerOverclockChaos();
                      setActiveModal(null);
                    }}
                    style={{ clipPath: CLIP_BTN }}
                    className="p-2.5 bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66] text-[10px] font-black flex flex-col items-center gap-1"
                  >
                    <Shuffle size={15} /> OVERCLOCK
                  </button>
                  <button
                    onClick={toggleGyro}
                    style={{ clipPath: CLIP_BTN }}
                    className={`p-2.5 border text-[10px] font-black flex flex-col items-center gap-1 ${
                      gyroEnabled
                        ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Compass size={15} /> {gyroEnabled ? 'GYRO_ON' : 'GYRO_OFF'}
                  </button>
                </div>

                {/* Custom User Memory Banks (3 In-Memory Slots) */}
                <div className="bg-[#101018] border border-zinc-800 p-2.5 space-y-2">
                  <div className="text-[9px] font-black tracking-widest text-[#00F0FF]">
                    USER CYBERDECK MEMORY SLOTS (SAVE / LOAD CUSTOM STACKS)
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {savedUserSlots.map((slot, sIdx) => (
                      <div key={sIdx} className="flex flex-col gap-1 bg-black/60 p-1.5 border border-zinc-800">
                        <span className="text-[8px] font-black text-zinc-400">
                          SLOT_0{sIdx + 1} {slot ? `(${slot.count} FX)` : '[EMPTY]'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const cfg = engineRef.current.getConfig();
                              const count = Object.values(cfg.toggles).filter(Boolean).length;
                              setSavedUserSlots((prev) => {
                                const next = [...prev];
                                next[sIdx] = { cfg, count };
                                return next;
                              });
                              showToast(`SAVED_TO_SLOT_0${sIdx + 1}`);
                            }}
                            className="flex-1 py-1 bg-zinc-800 hover:bg-[#FCEE0A] hover:text-black text-[8px] font-black text-white"
                          >
                            SAVE
                          </button>
                          {slot && (
                            <button
                              onClick={() => {
                                syncEngineConfig(slot.cfg);
                                setActivePreset(`USER_0${sIdx + 1}`);
                                showToast(`LOADED_SLOT_0${sIdx + 1}`);
                                setActiveModal(null);
                              }}
                              className="flex-1 py-1 bg-[#00F0FF] text-black text-[8px] font-black"
                            >
                              LOAD
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(PRESETS).map(([name, data]) => {
                    const isCurrent = activePreset === name;
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setFxState(engineRef.current.applyPreset(name));
                          setActivePreset(name);
                          const firstOn = FX_REGISTRY.findIndex((f) => data.toggles[f.id]);
                          if (firstOn >= 0) setFocusedIndex(firstOn);
                          showToast(`BREACH // ${name}`);
                          setActiveModal(null);
                        }}
                        style={{
                          clipPath: CLIP_BTN,
                          borderColor: isCurrent ? '#FCEE0A' : data.color
                        }}
                        className={`p-3 border text-left transition-all ${
                          isCurrent ? 'bg-[#FCEE0A] text-black' : 'bg-[#12121C] text-white hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black tracking-widest">{name}</span>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: isCurrent ? '#000' : data.color }}
                          />
                        </div>
                        <div className={`text-[8px] truncate ${isCurrent ? 'text-black/80 font-bold' : 'text-zinc-400'}`}>
                          {Object.keys(data.toggles).join(' + ').toUpperCase()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeModal === 'matrix' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {FX_REGISTRY.map((fx, idx) => {
                  const Icon = ICON_MAP[fx.id] || Zap;
                  const active = fxState.toggles[fx.id];
                  const aes = LENS_AESTHETICS[fx.id] || LENS_AESTHETICS.thermal;
                  return (
                    <button
                      key={fx.id}
                      onClick={() => {
                        setFocusedIndex(idx);
                        syncEngineConfig({ toggles: { [fx.id]: !active } });
                        setActivePreset('CUSTOM');
                      }}
                      style={{
                        clipPath: CLIP_BTN,
                        borderColor: active ? aes.border : '#27272A'
                      }}
                      className={`p-2.5 border flex flex-col items-center gap-1 transition-all ${
                        active ? 'bg-zinc-900 text-white shadow-[0_0_12px_rgba(0,240,255,0.2)]' : 'bg-[#0C0C14] text-zinc-500'
                      }`}
                    >
                      <Icon size={16} style={{ color: active ? aes.border : '#71717A' }} />
                      <span className="text-[9px] font-black tracking-wider truncate w-full text-center">
                        {fx.label}
                      </span>
                      <span className="text-[7px] font-bold" style={{ color: active ? '#FCEE0A' : '#52525B' }}>
                        {active ? `${fxState.intensities[fx.id]}%` : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeModal === 'vault' && (
              <div className="space-y-3">
                {capturedShards.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500">NO SHARDS CAPTURED IN SESSION</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {capturedShards.map((shard) => (
                      <div
                        key={shard.id}
                        style={{ clipPath: CLIP_BTN }}
                        className="bg-[#12121C] border border-[#00F0FF]/50 overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-video bg-black">
                          {shard.type === 'IMG' ? (
                            <img src={shard.url} alt="shard" className="w-full h-full object-cover" />
                          ) : (
                            <video src={shard.url} controls loop className="w-full h-full object-cover" />
                          )}
                          <span className="absolute top-1 left-1 bg-black/80 text-[#FCEE0A] text-[8px] font-black px-1.5 py-0.5">
                            {shard.type} // {shard.preset}
                          </span>
                        </div>
                        <div className="p-2 flex items-center justify-between bg-[#0A0A10]">
                          <span className="text-[9px] text-zinc-400">{shard.time}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                saveMediaOffline(
                                  shard.url,
                                  `KIROSHI_${shard.id}.${shard.type === 'IMG' ? 'jpg' : 'webm'}`,
                                  shard.type === 'IMG' ? 'image/jpeg' : 'video/webm',
                                  (nativeMsg) => showToast(nativeMsg || 'SHARD_DOWNLOADED')
                                )
                              }
                              className="p-1 bg-[#00F0FF] text-black"
                              title="Download Shard"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              onClick={() => {
                                if (shard.type === 'BD_VID' && shard.url) URL.revokeObjectURL(shard.url);
                                setCapturedShards((prev) => prev.filter((s) => s.id !== shard.id));
                              }}
                              className="p-1 bg-[#FF003C] text-white"
                              title="Delete Shard"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeModal === 'settings' && (
              <div className="space-y-3">
                <div className="bg-[#12121C] border border-zinc-800 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#FCEE0A]">OPTIC INPUT FEED</div>
                    <div className="text-[10px] text-zinc-400">Toggle Live Camera vs Night City Synth Feed</div>
                  </div>
                  <button
                    onClick={() => {
                      if (mediaType === 'synth') startCamera(facingMode);
                      else startSynthSignal();
                    }}
                    style={{ clipPath: CLIP_BTN }}
                    className="px-3 py-1.5 bg-[#00F0FF] text-black font-black text-[10px]"
                  >
                    {mediaType === 'synth' ? 'LIVE_CAM' : 'SYNTH_FEED'}
                  </button>
                </div>

                <div className="bg-[#12121C] border border-zinc-800 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-white">TOUCH GRAVITY SHOCKWAVE</div>
                    <div className="text-[10px] text-zinc-400">Tap or drag the viewfinder to bend light & space</div>
                  </div>
                  <button
                    onClick={() => setTouchShockwave((s) => !s)}
                    style={{ clipPath: CLIP_BTN }}
                    className={`px-3 py-1 font-black text-[10px] ${
                      touchShockwave ? 'bg-[#00FF66] text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {touchShockwave ? 'ENABLED' : 'OFFLINE'}
                  </button>
                </div>

                <div className="bg-[#12121C] border border-zinc-800 p-3 flex items-center justify-between">
                  <span className="text-xs font-black text-white">RGB / LUMA WAVEFORM SCOPE</span>
                  <button
                    onClick={() => setShowScope((s) => !s)}
                    style={{ clipPath: CLIP_BTN }}
                    className={`px-3 py-1 font-black text-[10px] ${
                      showScope ? 'bg-[#00F0FF] text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {showScope ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>

                <div className="bg-[#12121C] border border-zinc-800 p-3 flex items-center justify-between">
                  <span className="text-xs font-black text-white">KIROSHI TARGETING RETICLE</span>
                  <button
                    onClick={() => setShowReticle((r) => !r)}
                    style={{ clipPath: CLIP_BTN }}
                    className={`px-3 py-1 font-black text-[10px] ${
                      showReticle ? 'bg-[#00FF66] text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {showReticle ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>

                <div className="bg-[#12121C] border border-zinc-800 p-3 flex items-center justify-between">
                  <span className="text-xs font-black text-white">HIGH-BITRATE FRAME CAPTURE</span>
                  <button
                    onClick={() => setHqExport((q) => !q)}
                    style={{ clipPath: CLIP_BTN }}
                    className={`px-3 py-1 font-black text-[10px] ${
                      hqExport ? 'bg-[#FCEE0A] text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {hqExport ? 'RAW_95%' : 'COMP_75%'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}