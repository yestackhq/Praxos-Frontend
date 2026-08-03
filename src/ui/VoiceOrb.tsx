import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The Praxos voice orb — David Umoru's WebGL2 "shader orb"
 * (github.com/davidumoru/playground · components/experiments/shader-orb.tsx),
 * adapted so it MOVES WITH THE VOICE instead of looping on a timer.
 *
 * Two changes to the original:
 *   • a `u_level` uniform, fed each frame from the live audio analyser, swells
 *     the orb's radius and drives the three wave layers and their churn speed,
 *     so the surface is a readout of the tutor's actual speech;
 *   • the noise texture is generated procedurally on a canvas rather than
 *     fetched, so the component ships with no external asset.
 *
 * Falls back to a CSS gradient when WebGL2 is unavailable.
 */

export type VoiceOrbState = "idle" | "connecting" | "listening" | "speaking";

const VERTEX_SHADER = `#version 300 es
out vec4 out_position;
out vec2 out_uv;

const vec4 blitFullscreenTrianglePositions[6] = vec4[](
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(3.0, -1.0, 0.0, 1.0),
    vec4(-1.0, 3.0, 0.0, 1.0),
    vec4(-1.0, -1.0, 0.0, 1.0),
    vec4(3.0, -1.0, 0.0, 1.0),
    vec4(-1.0, 3.0, 0.0, 1.0)
);

void main() {
    out_position = blitFullscreenTrianglePositions[gl_VertexID];
    out_uv = out_position.xy * 0.5 + 0.5;
    out_uv.y = 1.0 - out_uv.y;
    gl_Position = out_position;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

#define E (2.71828182846)
#define pi (3.14159265358979323844)
#define NUM_OCTAVES (4)

in vec2 out_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_stateTime;
uniform vec2 u_viewport;

uniform sampler2D uTextureNoise;
uniform vec3 u_bloopColorMain;
uniform vec3 u_bloopColorLow;
uniform vec3 u_bloopColorMid;
uniform vec3 u_bloopColorHigh;

// Praxos additions: u_level is the live voice amplitude (0-1, smoothed on the
// CPU); u_active fades the whole orb up while a session is running.
uniform float u_level;
uniform float u_active;

struct ColoredSDF {
    float distance;
    vec4 color;
};

struct SDFArgs {
    vec2 st;
    float duration;
    float time;
};

float scaled(float edge0, float edge1, float x) { return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0); }
float fixedSpring(float t, float d) {
    float s = mix(1.0 - exp(-E * 2.0 * t) * cos((1.0 - d) * 115.0 * t), 1.0, clamp(t, 0.0, 1.0));
    return s * (1.0 - t) + t;
}

vec3 blendLinearBurn_13_5(vec3 base, vec3 blend, float opacity) {
    return (max(base + blend - vec3(1.0), vec3(0.0))) * opacity + base * (1.0 - opacity);
}

vec4 permute(vec4 x) { return mod((x * 34.0 + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    float res = mix(
        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
        u.y
    );
    return res * res;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0); Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = vec4(Pi0.z); vec4 iz1 = vec4(Pi1.z);
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0); vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 / 7.0; vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(vec4(0.0), gx0) - 0.5);
    gy0 -= sz0 * (step(vec4(0.0), gy0) - 0.5);
    vec4 gx1 = ixy1 / 7.0; vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(vec4(0.0), gx1) - 0.5);
    gy1 -= sz1 * (step(vec4(0.0), gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x); vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z); vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x); vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z); vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
    float n000 = dot(g000, Pf0); float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

ColoredSDF getOrb(SDFArgs args) {
    ColoredSDF sdf;
    float entryAnimation = fixedSpring(scaled(0.0, 2.0, args.duration), 0.92);

    float baseRadius = 0.37;
    float entryScale = mix(0.9, 1.0, entryAnimation);
    // Breathe with the voice: a gentle idle pulse, plus real swell on speech.
    float idlePulse = 0.010 * sin(args.time * 1.1);
    // Swell is deliberately small. A large radius response reads as the orb
    // lurching on every syllable rather than breathing with the voice.
    float radius = baseRadius * entryScale * (1.0 + idlePulse + u_level * 0.045);

    vec2 adjusted_st = args.st;

    float scaleFactor = 1.0 / (2.0 * radius);
    vec2 uv = adjusted_st * scaleFactor + 0.5;
    uv.y = 1.0 - uv.y;

    float noiseScale = 1.25;
    float windSpeed = 0.12;
    float warpPower = 0.35;
    float waterColorNoiseScale = 18.0;
    float waterColorNoiseStrength = 0.02;
    float textureNoiseScale = 1.0;
    float textureNoiseStrength = 0.15;
    float verticalOffset = 0.09;
    float waveSpread = 1.0;
    // The three wave layers churn harder the louder the tutor is speaking, so
    // the surface reads as "this is the voice" rather than a looping animation.
    float layer1Amplitude = 1.5 + u_level * 0.20;
    float layer1Frequency = 1.0;
    float layer2Amplitude = 1.4 + u_level * 0.16;
    float layer2Frequency = 1.0;
    float layer3Amplitude = 1.3 + u_level * 0.12;
    float layer3Frequency = 1.0;
    float fbmStrength = 1.2;
    float fbmPowerDamping = 0.55;
    float overallSoundScale = 1.0;
    float blurRadius = 1.45;
    // Churn speed barely tracks the voice: tying it hard to the level was what
    // made the surface look frantic while speaking.
    float timescale = 1.0 + u_level * 0.15;

    float time = args.time * timescale * 0.85;
    verticalOffset += 1.0 - waveSpread;

    float noiseX = cnoise(vec3(uv * 1.0 + vec2(0.0, 74.8572), time * 0.3));
    float noiseY = cnoise(vec3(uv * 1.0 + vec2(203.91282, 10.0), time * 0.3));
    uv += vec2(noiseX * 2.0, noiseY) * warpPower;

    float noiseA = cnoise(vec3(uv * waterColorNoiseScale + vec2(344.91282, 0.0), time * 0.3)) +
                   cnoise(vec3(uv * waterColorNoiseScale * 2.2 + vec2(723.937, 0.0), time * 0.4)) * 0.5;
    uv += noiseA * waterColorNoiseStrength;
    uv.y -= verticalOffset;

    vec2 textureUv = uv * textureNoiseScale;
    float textureSampleR0 = texture(uTextureNoise, textureUv).r;
    float textureSampleG0 = texture(uTextureNoise, vec2(textureUv.x, 1.0 - textureUv.y)).g;
    float textureNoiseDisp0 = mix(textureSampleR0 - 0.5, textureSampleG0 - 0.5, (sin(time) + 1.0) * 0.5) * textureNoiseStrength;

    textureUv += vec2(63.861, 368.937);
    float textureSampleR1 = texture(uTextureNoise, textureUv).r;
    float textureSampleG1 = texture(uTextureNoise, vec2(textureUv.x, 1.0 - textureUv.y)).g;
    float textureNoiseDisp1 = mix(textureSampleR1 - 0.5, textureSampleG1 - 0.5, (sin(time) + 1.0) * 0.5) * textureNoiseStrength;

    textureUv += vec2(272.861, 829.937);
    textureUv += vec2(180.302, 819.871);
    float textureSampleR3 = texture(uTextureNoise, textureUv).r;
    float textureSampleG3 = texture(uTextureNoise, vec2(textureUv.x, 1.0 - textureUv.y)).g;
    float textureNoiseDisp3 = mix(textureSampleR3 - 0.5, textureSampleG3 - 0.5, (sin(time) + 1.0) * 0.5) * textureNoiseStrength;
    uv += textureNoiseDisp0;

    vec2 st_fbm = uv * noiseScale;
    vec2 q = vec2(0.0);
    q.x = fbm(st_fbm * 0.5 + windSpeed * time);
    q.y = fbm(st_fbm * 0.5 + windSpeed * time);
    vec2 r = vec2(0.0);
    r.x = fbm(st_fbm + 1.0 * q + vec2(0.3, 9.2) + 0.15 * time);
    r.y = fbm(st_fbm + 1.0 * q + vec2(8.3, 0.8) + 0.126 * time);
    float f = fbm(st_fbm + r - q);
    float fullFbm = (f + 0.6 * f * f + 0.7 * f + 0.5) * 0.5;
    fullFbm = pow(fullFbm, fbmPowerDamping);
    fullFbm *= fbmStrength;

    blurRadius = blurRadius * 1.5;

    vec2 snUv = (uv + vec2((fullFbm - 0.5) * 1.2) + vec2(0.0, 0.025) + textureNoiseDisp0) * vec2(layer1Frequency, 1.0);
    float sn = noise(snUv * 2.0 + vec2(0.0, time * 0.5)) * 2.0 * layer1Amplitude;
    float sn2 = smoothstep(sn - 1.2 * blurRadius, sn + 1.2 * blurRadius, (snUv.y - 0.5 * waveSpread) * 5.0 + 0.5);

    vec2 snUvBis = (uv + vec2((fullFbm - 0.5) * 0.85) + vec2(0.0, 0.025) + textureNoiseDisp1) * vec2(layer2Frequency, 1.0);
    float snBis = noise(snUvBis * 4.0 + vec2(293.0, time * 1.0)) * 2.0 * layer2Amplitude;
    float sn2Bis = smoothstep(snBis - 0.9 * blurRadius, snBis + 0.9 * blurRadius, (snUvBis.y - 0.6 * waveSpread) * 5.0 + 0.5);

    vec2 snUvThird = (uv + vec2((fullFbm - 0.5) * 1.1) + textureNoiseDisp3) * vec2(layer3Frequency, 1.0);
    float snThird = noise(snUvThird * 6.0 + vec2(153.0, time * 1.2)) * 2.0 * layer3Amplitude;
    float sn2Third = smoothstep(snThird - 0.7 * blurRadius, snThird + 0.7 * blurRadius, (snUvThird.y - 0.9 * waveSpread) * 6.0 + 0.5);

    sn2 = pow(sn2, 0.8);
    sn2Bis = pow(sn2Bis, 0.9);

    vec3 sinColor;
    sinColor = blendLinearBurn_13_5(u_bloopColorMain, u_bloopColorLow, 1.0 - sn2);
    sinColor = blendLinearBurn_13_5(sinColor, mix(u_bloopColorMain, u_bloopColorMid, 1.0 - sn2Bis), sn2);
    sinColor = mix(sinColor, mix(u_bloopColorMain, u_bloopColorHigh, 1.0 - sn2Third), sn2 * sn2Bis);

    sdf.color = vec4(sinColor, 1.0);
    sdf.distance = length(adjusted_st) - radius;

    return sdf;
}

void main() {
    vec2 st = out_uv - 0.5;
    st.y *= u_viewport.y / u_viewport.x;

    SDFArgs args;
    args.st = st;
    args.time = u_time;
    args.duration = u_stateTime;

    ColoredSDF res = getOrb(args);

    float clampingTolerance = 0.0075;
    float clampedShape = smoothstep(clampingTolerance, 0.0, res.distance);
    float alpha = res.color.a * clampedShape * u_active;

    fragColor = vec4(res.color.rgb * alpha, alpha);
}`;

type ThemeColors = {
  main: [number, number, number];
  low: [number, number, number];
  mid: [number, number, number];
  high: [number, number, number];
};

/** Phantom periwinkle, shifted per session state so the orb reads at a glance:
 * cool while it listens, warm and bright while it speaks. */
const STATE_THEME: Record<VoiceOrbState, ThemeColors> = {
  idle: {
    main: [0.886, 0.875, 0.996],
    low: [0.671, 0.624, 0.949],
    mid: [0.757, 0.71, 0.98],
    high: [0.96, 0.95, 1.0],
  },
  connecting: {
    main: [0.85, 0.86, 1.0],
    low: [0.55, 0.6, 0.93],
    mid: [0.68, 0.72, 0.98],
    high: [0.95, 0.96, 1.0],
  },
  listening: {
    main: [0.82, 0.9, 0.99],
    low: [0.5, 0.68, 0.92],
    mid: [0.62, 0.78, 0.97],
    high: [0.93, 0.98, 1.0],
  },
  speaking: {
    main: [0.9, 0.78, 1.0],
    low: [0.671, 0.482, 0.949],
    mid: [0.78, 0.6, 1.0],
    high: [1.0, 0.94, 1.0],
  },
};

/** A tiling RGBA noise tile, built on a canvas. The upstream component fetched a
 * .webp; generating it keeps this component self-contained (and avoids a network
 * round trip before the orb can render). */
function createNoiseTexture(gl: WebGL2RenderingContext): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  // Value noise smoothed over a few octaves — the shader only samples .r/.g as a
  // low-frequency displacement, so cheap noise is indistinguishable here.
  const lattice = new Float32Array(size * size);
  for (let i = 0; i < lattice.length; i++) lattice[i] = Math.random();
  const sample = (x: number, y: number) =>
    lattice[((y % size) + size) % size * size + (((x % size) + size) % size)] ?? 0;
  const smooth = (x: number, y: number, step: number) => {
    const x0 = Math.floor(x / step) * step;
    const y0 = Math.floor(y / step) * step;
    const tx = (x - x0) / step;
    const ty = (y - y0) / step;
    const ex = tx * tx * (3 - 2 * tx);
    const ey = ty * ty * (3 - 2 * ty);
    const a = sample(x0, y0);
    const b = sample(x0 + step, y0);
    const c = sample(x0, y0 + step);
    const d = sample(x0 + step, y0 + step);
    return a * (1 - ex) * (1 - ey) + b * ex * (1 - ey) + c * (1 - ex) * ey + d * ex * ey;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let amp = 0.5;
      for (let step = 32; step >= 4; step >>= 1) {
        r += smooth(x, y, step) * amp;
        g += smooth(x + 97, y + 41, step) * amp;
        amp *= 0.5;
      }
      const o = (y * size + x) * 4;
      pixels[o] = Math.max(0, Math.min(255, Math.round(r * 255)));
      pixels[o + 1] = Math.max(0, Math.min(255, Math.round(g * 255)));
      pixels[o + 2] = 255;
      pixels[o + 3] = 255;
    }
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("VoiceOrb shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const UNIFORMS = [
  "u_time",
  "u_stateTime",
  "u_viewport",
  "uTextureNoise",
  "u_bloopColorMain",
  "u_bloopColorLow",
  "u_bloopColorMid",
  "u_bloopColorHigh",
  "u_level",
  "u_active",
] as const;

export function VoiceOrb({
  state = "idle",
  volumeRef,
  className,
}: {
  state?: VoiceOrbState;
  /** Live output level, 0-1, written every frame by the session hook. */
  volumeRef?: { current: number };
  className?: string;
  /** Accepted for source compatibility with the previous orb; the palette now
   * follows `state`. */
  variant?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<VoiceOrbState>(state);
  const levelRef = useRef(0);
  const envelopeRef = useRef(0);
  const failedRef = useRef(false);

  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) {
      failedRef.current = true;
      return;
    }

    const vert = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vert || !frag || !program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("VoiceOrb link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const loc: Partial<Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>> = {};
    for (const name of UNIFORMS) loc[name] = gl.getUniformLocation(program, name);

    const noise = createNoiseTexture(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noise);
    if (loc.uTextureNoise) gl.uniform1i(loc.uTextureNoise, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      return [w, h] as const;
    };

    const started = performance.now();
    let raf = 0;
    // Smoothed colour so a state change cross-fades instead of snapping.
    let theme = { ...STATE_THEME.idle };
    const mixInto = (
      target: [number, number, number],
      towards: readonly [number, number, number],
      k: number,
    ) => {
      target[0] += (towards[0] - target[0]) * k;
      target[1] += (towards[1] - target[1]) * k;
      target[2] += (towards[2] - target[2]) * k;
    };

    const render = () => {
      const [w, h] = resize();
      const now = (performance.now() - started) / 1000;

      // Two-stage smoothing. The analyser's per-frame RMS is extremely spiky —
      // feeding it straight in made the orb flicker on every syllable. The first
      // stage tracks the ENVELOPE of speech (still fairly quick to rise so the
      // orb doesn't feel dead), the second glides toward it, which is what makes
      // the motion read as smooth rather than reactive.
      const raw = Math.max(0, Math.min(1, volumeRef?.current ?? 0));
      const attack = raw > envelopeRef.current ? 0.10 : 0.030;
      envelopeRef.current += (raw - envelopeRef.current) * attack;
      levelRef.current += (envelopeRef.current - levelRef.current) * 0.06;

      const want = STATE_THEME[stateRef.current] ?? STATE_THEME.idle;
      mixInto(theme.main as [number, number, number], want.main, 0.06);
      mixInto(theme.low as [number, number, number], want.low, 0.06);
      mixInto(theme.mid as [number, number, number], want.mid, 0.06);
      mixInto(theme.high as [number, number, number], want.high, 0.06);

      if (loc.u_time) gl.uniform1f(loc.u_time, now);
      if (loc.u_stateTime) gl.uniform1f(loc.u_stateTime, now);
      if (loc.u_viewport) gl.uniform2fv(loc.u_viewport, [w, h]);
      if (loc.u_level) gl.uniform1f(loc.u_level, levelRef.current);
      if (loc.u_active) gl.uniform1f(loc.u_active, stateRef.current === "idle" ? 0.75 : 1);
      if (loc.u_bloopColorMain) gl.uniform3fv(loc.u_bloopColorMain, theme.main);
      if (loc.u_bloopColorLow) gl.uniform3fv(loc.u_bloopColorLow, theme.low);
      if (loc.u_bloopColorMid) gl.uniform3fv(loc.u_bloopColorMid, theme.mid);
      if (loc.u_bloopColorHigh) gl.uniform3fv(loc.u_bloopColorHigh, theme.high);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      if (noise) gl.deleteTexture(noise);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [volumeRef]);

  if (failedRef.current) {
    return (
      <div
        className={cn("rounded-full bg-gradient-to-br from-[#e2dffe] to-[#ab9ff2] blur-[2px]", className)}
        aria-hidden="true"
      />
    );
  }
  return <canvas ref={canvasRef} className={cn("block h-full w-full", className)} aria-hidden="true" />;
}

export default VoiceOrb;
