import * as THREE from "three";
import { TWEEN } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/libs/tween.module.min.js";
const transitionParams = {
  // useTexture: true,
  transition: 0,
  texture: 5,
  cycle: true,
  animate: true,
  // threshold: 0.3,
};

export function getTransição({ renderer, cenaA, cenaB }) {

  const cena = new THREE.Scene();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10, 10);

  const texturas = [];
  const loader = new THREE.TextureLoader();

  for (let i = 0; i < 3; i++) {
    texturas[i] = loader.load(`./img/transition${i}.png`);
  }

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse1: {
        value: null,
      },
      tDiffuse2: {
        value: null,
      },
      mixRatio: {
        value: 0.0,
      },
      threshold: {
        value: 0.1,
      },
      useTexture: {
        value: 1,
      },
      tMixTexture: {
        value: texturas[0],
      },
    },
    vertexShader: `varying vec2 vUv;
    void main() {
      vUv = vec2( uv.x, uv.y );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }`,
    fragmentShader: `
      uniform float mixRatio;
      uniform sampler2D tDiffuse1;
      uniform sampler2D tDiffuse2;
      uniform sampler2D tMixTexture;
      uniform int useTexture;
      uniform float threshold;
      varying vec2 vUv;

      void main() {
      	vec4 texel1 = texture2D( tDiffuse1, vUv );
      	vec4 texel2 = texture2D( tDiffuse2, vUv );

      	if (useTexture == 1) {
      		vec4 transitionTexel = texture2D( tMixTexture, vUv );
      		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
      		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);

      		gl_FragColor = mix( texel1, texel2, mixf );
      	} else {
      		gl_FragColor = mix( texel2, texel1, mixRatio );
      	}
      }`,
  });

  const geometria = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geometria, material);
  cena.add(mesh);

  material.uniforms.tDiffuse1.value = cenaA.fbo.texture;
  material.uniforms.tDiffuse2.value = cenaB.fbo.texture;

  new TWEEN.Tween(transitionParams)
    .to({ transition: 1 }, 4500)
    .repeat(Infinity)
    .delay(2000)
    .yoyo(true)
    .start();
  let needsTextureChange = false;

  const render = (delta) => {
    // animação de transição
    if (transitionParams.animate) {
      TWEEN.update();

      // Muda a cor da textura a cada transição
      if (transitionParams.cycle) {
        if (
          transitionParams.transition == 0 ||
          transitionParams.transition == 1
        ) {
          if (needsTextureChange) {
            transitionParams.texture =
              (transitionParams.texture + 1) % texturas.length;
            material.uniforms.tMixTexture.value =
              texturas[transitionParams.texture];
            needsTextureChange = false;
          }
        } else {
          needsTextureChange = true;
        }
      } else {
        needsTextureChange = true;
      }
    }

    material.uniforms.mixRatio.value = transitionParams.transition;

    // Previne renderizar ambas cenas quando não é necessário
    if (transitionParams.transition === 0) {
      cenaA.update(delta);
      cenaB.render(delta, false);
    } else if (transitionParams.transition === 1) {
      cenaA.render(delta, false);
      cenaB.update(delta);
    } else {
      // Quando 0<transition<1 renderiza a transição entre as duas cenas
      cenaA.render(delta, true);
      cenaB.render(delta, true);

      renderer.setRenderTarget(null); // null coloca o rt na cor nula do canvas
      renderer.render(cena, camera);
    }
  };
  return { render };
}