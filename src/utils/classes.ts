/**
 * Filename: classes.ts
 * Author: Franz Chuquirachi
 * Created: 2024-12-20
 * Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
 */

import * as THREE from 'three';

/**
 * InfiniteGridHelper class.
 * Code modified from: https://github.com/Fyrestar/THREE.InfiniteGridHelper
 */
export class InfiniteGridHelper extends THREE.Mesh {
  /**
   * Creates an instance of InfiniteGridHelper.
   * @param size1 - The size of the grid divisions.
   * @param size2 - The size of the the grid major divisions.
   * @param color - The color of the grid lines. Can be a THREE.Color, number, or string.
   * @param distance - The distance parameter affecting the grid's appearance.
   * @param axes - Defines the axes configuration for the grid helper.
   */
  constructor(
    // size1, size2, color, distance, axes = 'xzy') {
    size1: number = 10,
        size2: number = 100,
        color: THREE.Color | number | string = new THREE.Color('white'),
        distance: number = 8000,
        axes: 'xzy' | 'xyz' | 'yxz' | 'yzx' | 'zxy' | 'zyx' = 'xzy'
      ) {
    // color = color || new THREE.Color('white');
    // size1 = size1 || 10;
    // size2 = size2 || 100;
    // distance = distance || 8000;

    const planeAxes = axes.substr(0, 2);
    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uSize1: { value: size1 },
        uSize2: { value: size2 },
        uColor: { value: new THREE.Color(color) },
        uDistance: { value: distance },
      },
      transparent: true,
      vertexShader: `
           
           varying vec3 worldPosition;
		   
           uniform float uDistance;
           
           void main() {
           
                vec3 pos = position.${axes} * uDistance;
                pos.${planeAxes} += cameraPosition.${planeAxes};
                
                worldPosition = pos;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
           
           }
           `,
      fragmentShader: `
           
           varying vec3 worldPosition;
           
           uniform float uSize1;
           uniform float uSize2;
           uniform vec3 uColor;
           uniform float uDistance;
            
            
            
            float getGrid(float size) {
            
                vec2 r = worldPosition.${planeAxes} / size;
                
                
                vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
                float line = min(grid.x, grid.y);
                
            
                return 1.0 - min(line, 1.0);
            }
            
           void main() {
           
                
                  float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
                
                  float g1 = getGrid(uSize1);
                  float g2 = getGrid(uSize2);
                  
                  
                  gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
                  gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
                
                  if ( gl_FragColor.a <= 0.0 ) discard;
                
           
           }
           
           `,
      extensions: {
        derivatives: true
      }
    });

    super(geometry, material);
    this.frustumCulled = false;
  }
}

// export { InfiniteGridHelper };