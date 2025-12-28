
import * as THREE from 'three';

// --- Background Noise Shader ---
const bgFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uGrainStrength;

varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = vUv;
    vec2 pos = uv * 2.0 - 1.0;
    float dist = distance(pos, uMouse);
    float interaction = smoothstep(0.6, 0.0, dist);
    
    float staticGrain = snoise(uv * 800.0);
    float dynamicNoise = snoise(uv * 300.0 + uTime * 2.0 + interaction * 2.0);
    
    float grain = mix(
        staticGrain * 0.15,
        dynamicNoise * 0.3 + 0.1,
        interaction
    );
    
    // Show only the grain particles with transparency (black particles)
    float particleAlpha = abs(grain) * uGrainStrength;
    vec3 particleColor = vec3(0.0);  // Black particles

    gl_FragColor = vec4(particleColor, particleAlpha);
}
`;

const bgVertexShader = `
varying vec2 vUv;
varying vec2 vUv_screen;
void main() {
  vUv = uv;
  vUv_screen = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// --- Donut SDF Shader ---
const donutVertexShader = `
uniform vec2 uOffset;

varying vec2 vUv;

void main() {
  vUv = uv;
  // Apply offset to position the donut at top-right
  gl_Position = vec4(position.xy + uOffset, 0.0, 1.0);
}
`;

const donutFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;
varying vec2 vUv_screen;

// Reuse simplex noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Overlay Blend Mode Function
float blendOverlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(
        blendOverlay(base.r, blend.r),
        blendOverlay(base.g, blend.g),
        blendOverlay(base.b, blend.b)
    );
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0; // -1 to 1
    
    // Ring parameters - huge donut with thickness animation
    float innerRadius = 0.374; // Huge inner radius (10% larger)
    
    // Angle-based positioning
    float angle = atan(uv.y, uv.x) / (3.14159 * 2.0); // 0 to 1
    
    // Time-based four-stage thickness animation (like Creatura)
    // Smooth continuous animation with equal intervals
    float cycleTime = mod(uTime * 1.0, 4.0); // 4-second cycle
    
    // Thickness values for each stage
    float thick1 = 0.293; // Stage 1: 150px
    float thick2 = 0.1953; // Stage 2: 100px
    float thick3 = 0.293; // Stage 3: 150px
    float thick4 = 0.0020; // Stage 4: 1px
    
    // Smooth transitions between all stages using smoothstep
    float baseThickness;
    if (cycleTime < 1.0) {
        // Stage 1→2: 200px→100px
        baseThickness = mix(thick1, thick2, smoothstep(0.0, 1.0, cycleTime));
    } else if (cycleTime < 2.0) {
        // Stage 2→3: 100px→200px
        baseThickness = mix(thick2, thick3, smoothstep(1.0, 2.0, cycleTime));
    } else if (cycleTime < 3.0) {
        // Stage 3→4: 200px→1px
        baseThickness = mix(thick3, thick4, smoothstep(2.0, 3.0, cycleTime));
    } else {
        // Stage 4→1: 1px→200px (smooth return)
        baseThickness = mix(thick4, thick1, smoothstep(3.0, 4.0, cycleTime));
    }
    
    // Use consistent thickness across all angles (no wave modulation)
    float outerThickness = baseThickness;
    
    // ===== LOCAL ENLARGEMENT AT INTERSECTION POINTS =====
    // Right side intersection: angle ≈ 0.0 (or 1.0)
    // Top side intersection: angle ≈ 0.25
    float distToRight = min(abs(angle - 0.0), abs(angle - 1.0));
    float distToTop = abs(angle - 0.25);
    
    // Create smooth falloff cones around these points (±0.01 range)
    float rightMagnitude = smoothstep(0.01, 0.0, distToRight);
    float topMagnitude = smoothstep(0.01, 0.0, distToTop);
    float intersectionMagnitude = max(rightMagnitude, topMagnitude);
    
    // Create flare/trumpet effect: expand outward with angle-based modulation
    float flareExpansion = intersectionMagnitude * 0.05; // Radial expansion outward
    float flarethickness = intersectionMagnitude * 0.05; // Thickness increase (up to 1.05x)
    
    float localEnlargedThickness = outerThickness * (1.0 + flarethickness);
    float finalOuterThickness = mix(outerThickness, localEnlargedThickness, intersectionMagnitude);
    
    // Calculate radius and thickness for SDF - uniform across all angles
    // Add Simplex Noise to distort the shape (Organic feel)
    // Increased frequency significantly for very fine waves (12.0 -> 50.0)
    float shapeNoise = snoise(uv * 50.0 + uTime * 0.5); 
    
    // Calculate radius and thickness for SDF - modulated by noise
    // Reduced amplitude further (0.015 -> 0.005) for fine detail
    float radius = innerRadius + finalOuterThickness / 2.0 + shapeNoise * 0.005; 
    float thickness = finalOuterThickness / 2.0 + shapeNoise * 0.003;
    
    float softness = 0.08;
    
    // Base SDF calculation
    float dist = length(uv);
    float sdf = abs(dist - radius) - thickness;
    
    // Create smooth edge for the main shape
    float baseAlpha = 1.0 - smoothstep(0.0, softness, sdf);
    
    // Calculate edge distance for rainbow coloring
    // Normalize SDF to 0-1 range for the edge area
    float edgeDistance = smoothstep(-softness, softness, sdf);
    
    // Combine distance and angle for hue variation
    // When close to edge (sdf near -softness to softness), apply rainbow
    // Rotate 180 degrees so red appears at opposite diagonal (12px circle edge)
    float hueShift = (angle + 0.5) + edgeDistance * 0.3;
    
    // Add noise for a rough, grainy texture at the edges
    float edgeNoise = snoise(uv * 200.0 + vec2(uTime * 0.5)) * 0.15;
    
    // Create rainbow effect at the edges with more vibrant, warm colors
    // Higher brightness (0.93) for hotter appearance, saturation at 1.0 for vivid colors
    vec3 rainbowColor = hsv2rgb(vec3(hueShift + edgeNoise * 0.2, 1.0, 0.93 + edgeNoise * 0.15));
    
    // Stage 4 color adjustment: keep rainbow colors but make transparent
    float alphaMultiplier = 1.0;
    if (cycleTime >= 3.0 && cycleTime < 4.0) {
        // Keep the rainbow color, only adjust transparency
        alphaMultiplier = 0.93; // Extremely thin/transparent
    }
    
    // Blend: solid dark (pure black) in center, rainbow at edges
    // User requested Donut Color: #2e415c (RGB: 46, 65, 92)
    vec3 centerColor = vec3(46.0/255.0, 65.0/255.0, 92.0/255.0); 
    vec3 finalColor = mix(centerColor, rainbowColor, edgeDistance * (1.0 - baseAlpha) * 1.0);
    
    // Apply alpha with Stage 4 adjustment
    float alpha = baseAlpha * alphaMultiplier;
    
    if (alpha < 0.01) {
        discard;
    }
    
    // ===== FILM GRAIN / NOISE EFFECT =====
    // Add noisy texture ONLY at intersection points where donut meets circle
    float filmGrain = snoise(uv * 800.0 + uTime * 3.0) * 0.15;
    float fineGrain = snoise(uv * 2000.0 + uTime * 5.0) * 0.08;
    float grainNoise = filmGrain + fineGrain;
    
    // Apply grain ONLY near intersection points (scale by intersectionMagnitude)
    float grainIntensity = (grainNoise * 0.4 + grainNoise * 0.4) * intersectionMagnitude;
    
    // ===== LENS DISTORTION =====
    // Create barrel/pincushion distortion ONLY at intersection points
    vec2 distortedUv = uv;
    float baseDistortionStrength = 0.05;
    float distortionStrength = baseDistortionStrength * intersectionMagnitude; // Only at intersections
    float lensDistortion = dot(uv, uv);
    distortedUv = mix(uv, uv * (1.0 + lensDistortion * distortionStrength * 2.0), 0.5);
    
    // Apply lens distortion effect by recalculating with distorted UVs
    float distDist = length(distortedUv);
    float distSdf = abs(distDist - radius) - thickness;
    float distAlpha = 1.0 - smoothstep(0.0, softness, distSdf);
    
    // Blend lens-distorted alpha with grain - both scaled by intersectionMagnitude
    finalColor = mix(finalColor, finalColor + vec3(grainIntensity), intersectionMagnitude * 0.8);
    alpha = mix(alpha * distAlpha, alpha, 1.0 - intersectionMagnitude * 0.3);
    
    // ===== GLOBAL OVERLAY NOISE =====
    // Apply subtle overlay noise to the entire donut for texture
    float overlayNoise = snoise(uv * 800.0 + uTime * 5.0);
    vec3 noiseLayer = vec3(overlayNoise * 0.2 + 0.5); // Intensity 0.2, center 0.5
    finalColor = blendOverlay(finalColor, noiseLayer);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

// --- Star Shader ---
const starVertexShader = `
uniform vec2 uOffset;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  // Apply offset in screen/world space logic if needed, but here we move mesh
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const starFragmentShader = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;

// Reuse simplex noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Overlay Blend Mode
float blendOverlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(
        blendOverlay(base.r, blend.r),
        blendOverlay(base.g, blend.g),
        blendOverlay(base.b, blend.b)
    );
}

// HSV to RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Star SDF (Pentagram - One Stroke Style)
float sdSegment( in vec2 p, in vec2 a, in vec2 b ) {
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float sdPentagram(in vec2 p, in float r) {
    float d = 1e10;
    float PI = 3.14159265359;
    
    // 5 vertices
    vec2 v[5];
    for(int i=0; i<5; i++) {
        // Start from Top (PI/2), go counter-clockwise (adding 2PI/5)
        float ang = PI/2.0 + float(i) * 2.0 * PI / 5.0;
        v[i] = vec2(cos(ang), sin(ang)) * r;
    }
    
    // Connect vertices for Pentagram (0->2->4->1->3->0)
    d = min(d, sdSegment(p, v[0], v[2]));
    d = min(d, sdSegment(p, v[2], v[4]));
    d = min(d, sdSegment(p, v[4], v[1]));
    d = min(d, sdSegment(p, v[1], v[3]));
    d = min(d, sdSegment(p, v[3], v[0]));
    
    return d;
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0; // -1 to 1
    
    // Star parameters
    float size = 0.18; // Slightly larger (was 0.18)
    
    // Add Simplex Noise to distort the shape (Organic feel like donut)
    float shapeNoise = snoise(uv * 12.0 + uTime * 0.5); 
    
    // Modulate size with noise for organic feel
    float radius = size + shapeNoise * 0.01; 
    
    // SDF Calculation for Pentagram (Distance to the lines)
    // No rotation needed as calculation starts from PI/2 (Top)
    float distToLine = sdPentagram(uv, radius); 
    
    // Thickness: User requested thicker (0.003 -> 0.006 -> 0.004 -> 0.006)
    float thickness = 0.006 + shapeNoise * 0.001; 
    
    // For line drawing: alpha is 1 inside the line (dist < thickness)
    float starDist = distToLine - thickness;
    
    // Softness: Reduced significantly to ensure the thin line is visible
    float softness = 0.005; 
    
    // Create smooth edge (Blur)
    float baseAlpha = 1.0 - smoothstep(0.0, softness, starDist);
    
    // Noisy Fade / Kasure effect
    // Made much subtler to prevent disappearing
    float kasureNoise = snoise(uv * 150.0); 
    float kasureMod = smoothstep(-0.2, 0.6, kasureNoise);
    
    // Alpha: Ensure base visibility is high (0.6 minimum) -> Stronger: 0.8 minimum -> Weaker: 0.4 -> Slightly stronger: 0.6
    float alpha = baseAlpha * (0.6 + 0.3 * kasureMod);
    
    // Check alpha threshold
    if (alpha < 0.01) discard;

    // "Integrate with background" (Ink-like)
    // User requested "Same color as circle" (White)
    vec3 finalColor = vec3(1.0, 1.0, 1.0); 
    
    // Add some noise to the alpha to make it look like dry ink/texture
    float textureNoise = snoise(uv * 400.0 + uTime * 2.0);
    // Modulate alpha slightly with noise (0.8 to 1.0 range of original alpha) -> Stronger: 0.9 to 1.1 -> Weaker: 0.7 to 0.9
    // User requested "reverse" (weaker/thinner), then "transparency lower" (more opaque)
    float finalAlpha = alpha * (0.85 + 0.15 * textureNoise);
    
    // Clamp alpha to max 0.85 (somewhat opaque, but not fully black)
    finalAlpha = min(finalAlpha, 0.85);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

// --- Wave Shader ---
const waveVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const waveFragmentShader = `
uniform float uTime;

varying vec2 vUv;

// Voronoi / Cellular Noise function for "Cracked" effect
vec2 hash2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float voronoi( in vec2 x ) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ ) {
        vec2 g = vec2( float(i), float(j) );
        vec2 o = hash2( n + g );
        // Random offset for the cell point
        // Static cracks: remove uTime animation or make it very slow
        vec2 r = g - f + o; 
        float d = dot(r,r);
        if( d<m ) m=d;
    }
    return sqrt(m);
}

// Reuse simplex noise and blend functions
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float blendOverlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(
        blendOverlay(base.r, blend.r),
        blendOverlay(base.g, blend.g),
        blendOverlay(base.b, blend.b)
    );
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    // UV coordinates: -1 to 1
    // We want horizontal waves (y = f(x))
    vec2 uv = vUv * 2.0 - 1.0; 
    
    // Wave parameters
    float amplitude = 0.15; // User request: 0.15
    float frequency = 0.7;  // 15% bigger (wider) -> lower frequency
    float thickness = 0.006; 
    
    float safeThickness = 0.06;
    
    float lineSpacing = 0.345; // 15% wider spacing
    
    // Wave function (Sine Wave)
    float zigzag = sin(uv.x * frequency * 6.28318);
    
    // Define 3 lines
    float d1 = abs(uv.y - (-lineSpacing) - amplitude * zigzag) - safeThickness;
    float d2 = abs(uv.y - amplitude * zigzag) - safeThickness;
    float d3 = abs(uv.y - (lineSpacing) - amplitude * zigzag) - safeThickness;
    
    // Union of 3 lines (min distance)
    float sdf = min(d1, min(d2, d3));
    
    // Blur effect: Increased softness from 0.02 to 0.06
    float softness = 0.06;
    
    // Create smooth edge
    float baseAlpha = 1.0 - smoothstep(0.0, softness, sdf);
    
    // Edge distance for rainbow
    float edgeDistance = smoothstep(-softness, softness, sdf);
    
    // Hue shift
    float hueShift = (uv.x * 0.5 + 0.5) + edgeDistance * 0.3;
    
    // Add noise for texture
    float edgeNoise = snoise(uv * 200.0 + vec2(uTime * 0.5)) * 0.15;
    
    // Rainbow color
    vec3 rainbowColor = hsv2rgb(vec3(hueShift + edgeNoise * 0.2, 1.0, 0.93 + edgeNoise * 0.15));
    
    // Blend: dark center, rainbow edges
    // User requested "Same color as donut" (Navy Blue #2e415c)
    // RGB: 46, 65, 92 -> normalized: 0.18, 0.25, 0.36
    vec3 centerColor = vec3(46.0/255.0, 65.0/255.0, 92.0/255.0); 
    
    vec3 finalColor = mix(centerColor, rainbowColor, edgeDistance * (1.0 - baseAlpha) * 1.0);
    
    // Film Grain
    float filmGrain = snoise(uv * 800.0 + uTime * 3.0) * 0.15;
    finalColor += vec3(filmGrain * 0.05);
    
    // Overlay Noise
    float overlayNoise = snoise(uv * 800.0 + uTime * 5.0);
    vec3 noiseLayer = vec3(overlayNoise * 0.2 + 0.5);
    finalColor = blendOverlay(finalColor, noiseLayer);
    
    // Overall transparency
    float globalOpacity = 1.0;

    // Right edge TEXTURE EFFECT (Dry Brush / Chalk / Sand)
    // 1. Texture Map (High Frequency Simplex Noise for Sand/Chalk look)
    // Animate the noise to make it "chirachira" (flicker/flutter)
    // Using quantized time step to make it flicker abruptly like old film/noise
    float timeStep = floor(uTime * 15.0); 
    float sand = snoise(uv * 150.0 + vec2(timeStep * 10.0)); 
    
    // 2. Region Mask (Where to apply the effect)
    // User request: "Flip transparency effect horizontally"
    // Now: Strong on Left (since wave moved to Right side, "inner" is Left)
    float effectRegion = smoothstep(0.8, 0.05, vUv.x);
    
    // 3. Modulate Alpha based on texture
    // Increased roughness and contrast to make noise stand out more
    float roughness = 0.95; // Increased from 0.6 for stronger effect
    
    // Sharper smoothstep range (-0.1 to 0.4) creates higher contrast (sharper grains)
    float textureMod = mix(1.0, smoothstep(-0.1, 0.4, sand), roughness * effectRegion);
    
    // Ensure it doesn't disappear completely, just gets very scratchy/faint
    // Mix with a base minimum opacity so the shape is always somewhat visible
    float finalMod = mix(textureMod, 1.0, 1.0 - effectRegion); 
    
    // Apply Global Opacity
    float finalAlpha = baseAlpha * globalOpacity * finalMod;

    // Discard only if completely invisible
    if (finalAlpha < 0.01) discard;
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

// --- Text Overlay Shader ---
const textVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const textFragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;

// Simple Noise function (reused)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Overlay Blend Mode Function
float blendOverlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(
        blendOverlay(base.r, blend.r),
        blendOverlay(base.g, blend.g),
        blendOverlay(base.b, blend.b)
    );
}

void main() {
    // Chromatic Aberration
    // Calculate displacement vector from center
    vec2 dir = vUv - 0.5;
    float dist = length(dir);
    
    // Normalize direction
    vec2 normDir = (dist > 0.0) ? dir / dist : vec2(0.0);
    
    // Strength of aberration
    float aberrationStrength = 0.02; // Slightly stronger for text
    
    // Calculate offsets for Red, Green, Blue channels
    vec2 redOffset = normDir * dist * aberrationStrength;
    vec2 blueOffset = -normDir * dist * aberrationStrength;
    
    // Sample texture channels with offsets
    float r = texture2D(uTexture, vUv + redOffset).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv + blueOffset).b;
    float a = texture2D(uTexture, vUv).a;
    
    vec3 baseColor = vec3(r, g, b);

    // Generate animated noise (Film Grain) - Even stronger intensity (User requested "further strong noise")
    float noise = snoise(vUv * 800.0 + uTime * 20.0); // Higher freq, faster
    vec3 noiseLayer = vec3(noise * 0.7 + 0.5); // Intensity increased (0.4 -> 0.7)
    
    // Apply overlay noise to the text
    vec3 finalColor = blendOverlay(baseColor, noiseLayer);
    
    // Apply noise to alpha for "kasure" (scratched) effect
    // Use high freq noise for texture
    float alphaNoise = snoise(vUv * 500.0 + vec2(0.0, uTime * 5.0));
    float alphaMod = smoothstep(-0.2, 0.7, alphaNoise); 
    
    // Combine texture alpha, opacity prop, and noise modulation
    // Made erosion stronger (0.7 min -> 0.4 min) to look more "damaged/noisy"
    float finalAlpha = a * uOpacity * (0.4 + 0.6 * alphaMod);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

// --- Image Display Shader ---
const imageVertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const imageFragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;

// Simple Noise function (reused)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Overlay Blend Mode Function
// Formula: base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend))
float blendOverlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(
        blendOverlay(base.r, blend.r),
        blendOverlay(base.g, blend.g),
        blendOverlay(base.b, blend.b)
    );
}

void main() {
    // World Space Circular Mask (Clipping to the main circle container)
    // Radius ~0.8 corresponds to the 512px circle boundary in this camera setup
    if (length(vWorldPosition.xy) > 0.8) {
        discard;
    }
    
    // Chromatic Aberration
    // Calculate displacement vector from center
    vec2 dir = vUv - 0.5;
    float dist = length(dir);
    
    // Normalize direction, handle center case to avoid division by zero
    vec2 normDir = (dist > 0.0) ? dir / dist : vec2(0.0);
    
    // Strength of aberration - increases with distance from center
    // This matches standard lens distortion chromatic aberration
    // Animate the strength with a slow breathing wave + RANDOM fast glitches
    float breath = sin(uTime * 1.5) * 0.5 + 0.5; // 0.0 to 1.0 slow wave
    
    // Random glitch using hash function for non-periodic behavior
    // We sample randomness at 20fps and 50fps
    float glitchTime = uTime * 60.0; 
    float randVal = fract(sin(floor(glitchTime) * 12.9898) * 43758.5453);
    
    // Main Glitch: Threshold -> only glitch ~5% of the time, but completely random
    float mainGlitch = step(0.95, randVal) * randVal; // 0.0 or 0.95-1.0 range
    
    // Micro Glitch: Faster, sharper, rarer (2% chance)
    float r2 = fract(sin(floor(uTime * 120.0) * 78.233) * 43758.5453);
    float microGlitch = step(0.98, r2) * 0.5;
    
    // Combine glitches
    float glitch = max(mainGlitch, microGlitch);
    
    // Base strength 0.015, varying slightly with breath, spiking with glitch
    // Glitch adds significant displacement (0.05) for a "jump" effect
    float aberrationStrength = 0.015 + (breath * 0.005) + (glitch * 0.02); 
    
    // Add horizontal glitch shift
    // Use a different random seed for horizontal movement
    float r3 = fract(sin(floor(uTime * 90.0) * 91.1) * 43758.5453);
    float hGlitch = step(0.96, r3) * (r3 - 0.96) * 20.0; // Random shift magnitude
    // Direction based on another random value
    float dirR = fract(sin(floor(uTime * 90.0) * 12.3) * 43758.5453);
    float hDir = (dirR > 0.5) ? 1.0 : -1.0;
    
    // Apply horizontal shift to UV
    vec2 glitchUv = vUv + vec2(hGlitch * hDir * 0.01, 0.0); // 0.03 max shift
    
    // Calculate offsets for Red, Green, Blue channels
    // Red shifts outward, Blue shifts inward (or vice versa)
    vec2 redOffset = normDir * dist * aberrationStrength;
    vec2 blueOffset = -normDir * dist * aberrationStrength;
    
    // Blur parameters
    vec4 sum = vec4(0.0);
    float totalWeight = 0.0;
    // Blur radius: 0.003 provides a gentle softening (feathering) of the edges
    float blurRadius = 0.003; 
    
    // 3x3 Gaussian-weighted blur loop
    // This softens both the RGB details and the Alpha channel (edges)
    for(float x = -1.0; x <= 1.0; x+=1.0) {
        for(float y = -1.0; y <= 1.0; y+=1.0) {
            vec2 offset = vec2(x, y) * blurRadius;
            
            // Weight falls off with distance from center sample
            float weight = 1.0 / (1.0 + dot(vec2(x,y), vec2(x,y)));
            
            // Sample each channel with its specific chromatic aberration offset PLUS the blur offset
            // AND use the glitched UV coordinates
            float r_s = texture2D(uTexture, glitchUv + redOffset + offset).r;
            float g_s = texture2D(uTexture, glitchUv + offset).g;
            float b_s = texture2D(uTexture, glitchUv + blueOffset + offset).b;
            float a_s = texture2D(uTexture, glitchUv + offset).a;
            
            sum += vec4(r_s, g_s, b_s, a_s) * weight;
            totalWeight += weight;
        }
    }
    
    // Normalize weighted sum
    vec4 blurred = sum / totalWeight;
    float r = blurred.r;
    float g = blurred.g;
    float b = blurred.b;
    float a = blurred.a;
    
    // Removed the strict alpha threshold (if (a < 0.3) discard)
    // This allows the soft, semi-transparent edges from the blur to render,
    // creating the desired "feathered" look for the cutout.
    if (a <= 0.0) {
        discard;
    }
    
    vec3 baseColor = vec3(r, g, b);

    // Generate animated noise (Film Grain)
    float noise = snoise(vUv * 800.0 + uTime * 5.0);
    // Map noise from -1..1 to 0..1 range
    // We want the noise to be centered around 0.5 (grey) for Overlay
    // A value of 0.5 in Overlay mode means "no change"
    vec3 noiseLayer = vec3(noise * 0.2 + 0.5); // Intensity 0.2, center 0.5
    
    // Apply Overlay Blend Mode
    // Blend the Image (Base) with the Noise (Blend)
    vec3 finalColor = blendOverlay(baseColor, noiseLayer);
    
    gl_FragColor = vec4(finalColor, a);
}
`;

// --- Circle Shader (Bottom Left) ---
const circleVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const circleFragmentShader = `
uniform float uTime;

varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    // UV coordinates: -1 to 1
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Circle distance from center
    float dist = length(uv);
    
    // Circle radius
    float radius = 0.4;
    
    // Edge distance (for blur/feather)
    float edgeDist = dist - radius;
    
    // Enhanced blur: increased softness for more blur/smudge
    float softness = 0.15;
    
    // Create smooth edge
    float baseAlpha = 1.0 - smoothstep(0.0, softness, edgeDist);
    
    // Glow expansion/contraction animation (breathing effect)
    float breathing = sin(uTime * 2.5) * 0.08 + 0.12; // Oscillate glow radius
    
    // Glow effect: Enhanced with more intensity and breathing animation
    float glowRadius = radius + breathing; // Dynamic glow radius
    float glowEdgeDist = dist - glowRadius;
    float glowSoftness = 0.35; // Softer glow falloff
    float glowAlpha = (1.0 - smoothstep(-0.08, glowSoftness, glowEdgeDist)) * 0.65;
    
    // Discard if completely transparent
    if (baseAlpha < 0.01 && glowAlpha < 0.01) discard;
    
    // Very dark, nearly pure black color
    vec3 baseColor = vec3(3.0/255.0, 4.0/255.0, 6.0/255.0); // Much closer to pure black
    
    // Dark glow color (muted, dim light)
    vec3 glowColor = vec3(60.0/255.0, 80.0/255.0, 110.0/255.0); // Dark blue glow, not cyan
    
    // Add film grain
    float filmGrain = snoise(uv * 800.0 + uTime * 3.0) * 0.15;
    baseColor += vec3(filmGrain * 0.02);
    
    // Overlay noise
    float overlayNoise = snoise(uv * 800.0 + uTime * 5.0);
    vec3 noiseLayer = vec3(overlayNoise * 0.2 + 0.5);
    baseColor = mix(baseColor, noiseLayer, 0.15);
    
    // Blend glow and base
    vec3 finalColor = mix(baseColor, glowColor, glowAlpha);
    float finalAlpha = mix(baseAlpha, glowAlpha, glowAlpha * 0.6) * 0.95;
    
    gl_FragColor = vec4(finalColor, max(baseAlpha * 0.95, finalAlpha));
}
`;

// --- Main Class ---
export default class NoiseOverlay {
    constructor() {
        this.meshes = [];
        this.clock = new THREE.Clock();
        this.textureBaseUrl = '../images/'; // Adjust based on your asset path structure
    }

    init(scene) {
        this.scene = scene;
        
        // 1. ImageDisplay (The Woman)
        this.createImageDisplay();

        // 2. TextOverlays
        this.createTextOverlays();

        // 3. ShaderDonut
        this.createDonut();

        // 4. ShaderStar
        this.createStar();

        // 5. ShaderWave
        this.createWave();

        // 6. ShaderCircle (Bottom Left)
        this.createCircle();

        // 7. NoiseBackground
        this.createBackground();
    }

    createImageDisplay() {
        const uniforms = {
            uTexture: { value: null },
            uCircleRadius: { value: 0.45 },
            uTime: { value: 0 }
        };
        
        const loader = new THREE.TextureLoader();
        loader.load(this.textureBaseUrl + 'ikuko_nagao_1765788435867.png', (tex) => {
            uniforms.uTexture.value = tex;
        });

        const material = new THREE.ShaderMaterial({
            vertexShader: imageVertexShader,
            fragmentShader: imageFragmentShader,
            uniforms: uniforms,
            transparent: true,
            depthWrite: false
        });

        const geometry = new THREE.PlaneGeometry(1.02165, 1.52775);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-0.025, -0.256125, 0.1);
        
        this.scene.add(mesh);
        this.meshes.push({ mesh, uniforms });
    }

    createTextOverlays() {
        // [x, y, z]
        const basePositions = [
            [0.348, 0.430, 0.15],   // "Teki"
            [-0.434, 0.134, 0.14], // "Ten-sho"
            [-0.308, 0.466, 0.14],  // "Kami"
            [0.25, -0.40, 0.15],  // "Kannon"
        ];
        
        const fullOpacityIndex = Math.floor(Math.random() * basePositions.length);
        const loader = new THREE.TextureLoader();

        basePositions.forEach((pos, i) => {
            let scale = 0.7 + Math.random() * 0.6;
            let textureUrl = this.textureBaseUrl + 'teki_1765704087024.png';
            
            if (i === 0) {
                scale = 0.7 + Math.random() * 0.6;
                textureUrl = this.textureBaseUrl + 'teki_1765791687506.png'; 
            }
            if (i === 1) {
                scale = 1.265 + Math.random() * 0.3; 
                textureUrl = this.textureBaseUrl + 'ten_1765791687506.png'; 
            }
            if (i === 2) {
                scale = 0.8 + Math.random() * 0.2; 
                textureUrl = this.textureBaseUrl + 'kami_1765792857930.png'; 
            }
            if (i === 3) {
                scale = 1.11 + Math.random() * 0.3;
                textureUrl = this.textureBaseUrl + 'kan_1765790272413.png';
            }

            let opacity = 0.7 + Math.random() * 0.3;
            if (i === fullOpacityIndex) opacity = 1.0;

            let seed = Math.random();
            if (i === 0) seed = 0.123;
            if (i === 2) seed = 0.987;
            seed += i * 0.5;

            const uniforms = {
                uTexture: { value: null },
                uTime: { value: 0 },
                uOpacity: { value: opacity }
            };

            loader.load(textureUrl, (tex) => {
                uniforms.uTexture.value = tex;
            });

            const material = new THREE.ShaderMaterial({
                vertexShader: textVertexShader,
                fragmentShader: textFragmentShader,
                uniforms: uniforms,
                transparent: true,
                depthWrite: false
            });

            const baseWidth = 0.1024;
            const baseHeight = 0.1792;
            const geometry = new THREE.PlaneGeometry(baseWidth * scale, baseHeight * scale);
            const mesh = new THREE.Mesh(geometry, material);
            
            // Initial position (will be updated by animation)
            mesh.position.set(pos[0], pos[1], pos[2]);
            
            this.scene.add(mesh);
            
            // Custom update function for this text overlay
            const updateFunc = (time) => {
                const timeOffset = seed * 10.0;
                const stepTime = Math.floor((time + timeOffset) * 4.0) / 4.0; 
                const noiseX = Math.sin(stepTime * 0.5) * 0.02 + Math.sin(stepTime * 0.3 + 2.0) * 0.015;
                const noiseY = Math.cos(stepTime * 0.4) * 0.02 + Math.cos(stepTime * 0.25 + 1.5) * 0.015;
                
                mesh.position.x = pos[0] + noiseX;
                mesh.position.y = pos[1] + noiseY;
                mesh.position.z = pos[2];
                
                const opacityAnim = 0.5 + 0.5 * ((Math.sin(time * 2.0 + seed * 10.0) + 1.0) / 2.0);
                
                if (opacity >= 0.99) {
                    uniforms.uOpacity.value = 0.85 + 0.15 * Math.sin(time * 1.5 + seed * 5.0); 
                } else {
                    uniforms.uOpacity.value = opacityAnim;
                }
            };

            this.meshes.push({ mesh, uniforms, update: updateFunc });
        });
    }

    createDonut() {
        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uOffset: { value: new THREE.Vector2(0.0, 0.866) }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: donutVertexShader,
            fragmentShader: donutFragmentShader,
            uniforms: uniforms,
            transparent: true,
            depthWrite: false
        });

        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);

        this.scene.add(mesh);

        const updateFunc = (time) => {
            const stepTime = Math.floor(time * 2) * 0.5;
            const noiseX = Math.sin(stepTime * 0.5) * 0.02 + Math.sin(stepTime * 0.3 + 2.0) * 0.015;
            const noiseY = Math.cos(stepTime * 0.4) * 0.02 + Math.cos(stepTime * 0.25 + 1.5) * 0.015;
            const offsetX = 0.0 + noiseX;
            const offsetY = 0.866 + noiseY;
            uniforms.uOffset.value.set(offsetX, offsetY);
        };

        this.meshes.push({ mesh, uniforms, update: updateFunc });
    }

    createStar() {
        const uniforms = { uTime: { value: 0 } };
        const material = new THREE.ShaderMaterial({
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
            uniforms: uniforms,
            transparent: true,
            depthWrite: false
        });

        const geometry = new THREE.PlaneGeometry(0.85, 0.85); // Size 0.85
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 999;
        mesh.position.set(-0.139, -0.0415, 0.6);

        this.scene.add(mesh);

        const updateFunc = (time) => {
            const moveX = Math.sin(time * 0.25) * 0.008 + Math.cos(time * 0.35) * 0.006;
            const moveY = Math.cos(time * 0.28) * 0.008 + Math.sin(time * 0.32) * 0.006;
            mesh.position.x = -0.139 + moveX;
            mesh.position.y = -0.0415 + moveY;
        };

        this.meshes.push({ mesh, uniforms, update: updateFunc });
    }

    createWave() {
        const uniforms = { uTime: { value: 0 } };
        const material = new THREE.ShaderMaterial({
            vertexShader: waveVertexShader,
            fragmentShader: waveFragmentShader,
            uniforms: uniforms,
            transparent: true,
            depthWrite: false
        });

        const geometry = new THREE.PlaneGeometry(0.72, 0.72);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0.51, 0, 0.05);

        this.scene.add(mesh);

        const updateFunc = (time) => {
           const moveX = Math.sin(time * 0.4) * 0.02 + Math.cos(time * 0.9) * 0.01;
           const moveY = Math.cos(time * 0.5) * 0.02 + Math.sin(time * 0.8) * 0.01;
           mesh.position.x = 0.51 + moveX;
           mesh.position.y = 0.0 + moveY;
        };

        this.meshes.push({ mesh, uniforms, update: updateFunc });
    }

    createCircle() {
        const uniforms = { uTime: { value: 0 } };
        const material = new THREE.ShaderMaterial({
            vertexShader: circleVertexShader,
            fragmentShader: circleFragmentShader,
            uniforms: uniforms,
            transparent: true,
            depthWrite: false
        });

        const geometry = new THREE.PlaneGeometry(0.828, 0.828);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-0.584, -0.415, 0.05);

        this.scene.add(mesh);
        this.meshes.push({ mesh, uniforms });
    }

    createBackground() {
        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(9999, 9999) },
            uGrainStrength: { value: 0.9 }
        };
        const material = new THREE.ShaderMaterial({
            vertexShader: bgVertexShader,
            fragmentShader: bgFragmentShader,
            uniforms: uniforms,
            transparent: true,
            depthTest: false
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0.2);
        mesh.renderOrder = 100;

        this.scene.add(mesh);
        this.meshes.push({ mesh, uniforms });
    }

    update() {
        const time = this.clock.getElapsedTime();
        this.meshes.forEach(item => {
            if (item.uniforms && item.uniforms.uTime) {
                item.uniforms.uTime.value = time;
            }
            if (item.update) {
                item.update(time);
            }
        });
    }
    
    // Call this if you want to dispose of the effect cleanly
    dispose() {
        this.meshes.forEach(item => {
            this.scene.remove(item.mesh);
            if (item.mesh.geometry) item.mesh.geometry.dispose();
            if (item.mesh.material) item.mesh.material.dispose();
        });
        this.meshes = [];
    }
}
