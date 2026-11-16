// src/shaders/floor-shader.js - GPU Vertex & Fragment Shaders for procedural LED dance floor waves
import * as THREE from 'three';

export const FLOOR_VERTEX_SHADER = /* glsl */ `
  #include <common>

  uniform float u_wavePhase;
  uniform float u_bassFlux;
  uniform float u_minBrightness;
  uniform float u_isStatic;

  varying vec3 vWorldPos;
  varying vec3 vTileColor;

  void main() {
    // Transform by instanced matrix
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;

    // Calculate distance from stage center (0, 0)
    float distFromCenter = length(instanceMatrix[3].xz);
    float wave = sin(u_wavePhase - distFromCenter * 0.4);
    float waveIntensity = max(u_minBrightness, (wave + 1.0) * 0.5 * (1.0 + u_bassFlux * 0.03));
    float intensity = (u_isStatic > 0.5) ? 0.85 : waveIntensity;

    #ifdef USE_INSTANCING_COLOR
    vec3 baseCol = (length(instanceColor) > 0.01) ? instanceColor : vec3(0.54, 0.17, 0.89);
    #else
    vec3 baseCol = vec3(0.54, 0.17, 0.89);
    #endif

    vTileColor = baseCol * intensity;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const FLOOR_FRAGMENT_SHADER = /* glsl */ `
  #include <common>

  varying vec3 vTileColor;

  void main() {
    gl_FragColor = vec4(vTileColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Creates custom GPU ShaderMaterial for InstancedMesh LED Floor
 */
export function createGpuFloorMaterial(uniforms = {}) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: FLOOR_VERTEX_SHADER,
    fragmentShader: FLOOR_FRAGMENT_SHADER,
    uniforms: {
      u_wavePhase: { value: uniforms.wavePhase || 0.0 },
      u_bassFlux: { value: uniforms.bassFlux || 0.0 },
      u_minBrightness: { value: uniforms.minBrightness || 0.28 },
      u_isStatic: { value: uniforms.isStatic ? 1.0 : 0.0 }
    },
    toneMapped: true
  });
  // Maintain compatibility with MeshStandardMaterial color interface for test suites
  mat.color = new THREE.Color(0xffffff);
  return mat;
}
