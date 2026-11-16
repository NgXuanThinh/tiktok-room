// src/shaders/starfield-shader.js - GPU Vertex & Fragment Shaders for procedural twinkling stars
import * as THREE from 'three';

export const STARFIELD_VERTEX_SHADER = /* glsl */ `
  attribute vec2 aStarParams; // x: speed, y: phase
  attribute vec3 aBaseColor;

  uniform float u_time;
  uniform float u_trebleFlux;
  uniform float u_size;

  varying vec3 vColor;

  void main() {
    float twinkle = sin(u_time * aStarParams.x + aStarParams.y) * 0.35 + 0.65 + u_trebleFlux;
    vColor = aBaseColor * clamp(twinkle, 0.15, 1.8);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = u_size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const STARFIELD_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // Soft circular particle alpha falloff
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distSq = dot(coord, coord);
    if (distSq > 0.25) discard;

    float alpha = smoothstep(0.25, 0.05, distSq);
    gl_FragColor = vec4(vColor, alpha * 0.95);
  }
`;

/**
 * Factory creating GPU-accelerated Starfield ShaderMaterial
 */
export function createGpuStarfieldMaterial(size = 0.18) {
  return new THREE.ShaderMaterial({
    vertexShader: STARFIELD_VERTEX_SHADER,
    fragmentShader: STARFIELD_FRAGMENT_SHADER,
    uniforms: {
      u_time: { value: 0.0 },
      u_trebleFlux: { value: 0.0 },
      u_size: { value: size }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}
