import * as THREE from "three";
import { getFXCena } from "./FXCena.js";
import { getTransição } from "./Transição.js";

const relogio = new THREE.Clock();
let transição;
init();
animate();

function init() {
  const container = document.getElementById("container");

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const materialA = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
  });
  const materialB = new THREE.MeshStandardMaterial({
    color: 0xFF9900,
    flatShading: true,
  });
  const cenaA = getFXCena({
    renderer,
    material: materialA,
    clearColor: 0x000000,
    // needsAnimatedColor: true,
  });
  const cenaB = getFXCena({
    renderer,
    material: materialB,
    clearColor: 0x000000,
    needsAnimatedColor: true,
  });

  transição = getTransição({ renderer, cenaA, cenaB });
}

function animate() {
  requestAnimationFrame(animate);
  transição.render(relogio.getDelta());

}