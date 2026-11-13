import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene;
let camera;
let renderer;
let controls;
let loader;

let currentModel = null;
let selectedObject = null;
let originalMaterials = [];
let raycaster;
let mouse;
let container;
let selectionCallback = null;

export function initScene(containerElement, onSelect) {
  container = containerElement;
  selectionCallback = onSelect;

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#101b2b");

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1;
  controls.maxDistance = 20;

  loader = new GLTFLoader();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 3);
  mainLight.position.set(5, 8, 7);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x79bfff, 1.4);
  fillLight.position.set(-6, 2, -5);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0x8baeff, 1.2);
  backLight.position.set(0, 5, -7);
  scene.add(backLight);

  const floorGrid = new THREE.GridHelper(12, 24, 0x29415c, 0x1b3047);
  floorGrid.position.y = -2.5;
  scene.add(floorGrid);

  renderer.domElement.addEventListener("click", handleModelClick);

  window.addEventListener("resize", handleResize);

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (controls) {
    controls.update();
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function handleResize() {
  if (!container || !camera || !renderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}


export function loadModel(path, modelKey) {
  if (!loader || !scene) return;

  const loading = document.getElementById("loading");

  // Afficher le chargement
  if (loading) {
    loading.classList.remove("hidden");
    loading.innerHTML = `
      <strong>Chargement du modèle 3D</strong>
      <span>Veuillez patienter...</span>
    `;
  }

  // Supprimer l'ancien modèle
  if (currentModel) {
    scene.remove(currentModel);
    disposeModel(currentModel);
    currentModel = null;
  }

  clearSelection();

  loader.load(
    path,

    // SUCCÈS
    (gltf) => {
      currentModel = gltf.scene;
      currentModel.name = modelKey;

      currentModel.traverse((object) => {
        if (!object.isMesh) return;

        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material = object.material.map((mat) => {
              const material = mat.clone();

              if (material.map) {
                material.map.colorSpace = THREE.SRGBColorSpace;
              }

              return material;
            });
          } else {
            object.material = object.material.clone();

            if (object.material.map) {
              object.material.map.colorSpace = THREE.SRGBColorSpace;
            }
          }
        }
      });

      scene.add(currentModel);

      centerAndFitModel(currentModel);

      // MASQUER LE CHARGEMENT
      if (loading) {
        loading.classList.add("hidden");
      }

      console.log("Modèle chargé :", modelKey);

      console.log("Structures anatomiques :");

      currentModel.traverse((object) => {
        if (object.isMesh) {
          console.log(object.name || object.parent?.name);
        }
      });
    },

    // PROGRESSION
    (xhr) => {
      if (loading && xhr.total > 0) {
        const progress = Math.round(
          (xhr.loaded / xhr.total) * 100
        );

        loading.innerHTML = `
          <strong>Chargement du modèle 3D</strong>
          <span>${progress}%</span>
        `;
      }
    },

    // ERREUR
    (error) => {
      console.error("Erreur de chargement :", path, error);

      if (loading) {
        loading.classList.remove("hidden");

        loading.innerHTML = `
          <strong>Erreur de chargement</strong>
          <span>Impossible de charger le modèle 3D.</span>
        `;
      }
    }
  );
}

function centerAndFitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  model.position.sub(center);

  const maxDimension = Math.max(size.x, size.y, size.z);

  if (maxDimension > 0) {
    const scale = 3.5 / maxDimension;
    model.scale.setScalar(scale);
  }

  const scaledBox = new THREE.Box3().setFromObject(model);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  const scaledSize = scaledBox.getSize(new THREE.Vector3());

  model.position.sub(scaledCenter);

  const maxScaledDimension = Math.max(
    scaledSize.x,
    scaledSize.y,
    scaledSize.z
  );

  const distance =
    (maxScaledDimension / 2) /
    Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  camera.position.set(
    0,
    maxScaledDimension * 0.12,
    distance * 1.65
  );

  camera.near = 0.01;
  camera.far = 1000;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = Math.max(0.5, distance * 0.45);
  controls.maxDistance = Math.max(10, distance * 5);
  controls.update();
}

function handleModelClick(event) {
  if (!currentModel) return;

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const meshes = [];

  currentModel.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  });

  const intersections = raycaster.intersectObjects(meshes, false);

  if (intersections.length === 0) {
    clearSelection();
    return;
  }

  selectObject(intersections[0].object);
}

function selectObject(object) {
  clearSelection();

  selectedObject = object;

  if (Array.isArray(object.material)) {
    originalMaterials = object.material.map((material) => material.clone());

    object.material = object.material.map((material) => {
      const highlighted = material.clone();
      highlighted.emissive = new THREE.Color("#247dc2");
      highlighted.emissiveIntensity = 0.45;
      return highlighted;
    });
  } else if (object.material) {
    originalMaterials = [object.material.clone()];

    object.material = object.material.clone();
    object.material.emissive = new THREE.Color("#247dc2");
    object.material.emissiveIntensity = 0.45;
  }

  const objectName =
    object.name ||
    object.parent?.name ||
    "Structure anatomique";

  if (selectionCallback) {
    selectionCallback({
      name: objectName,
      object
    });
  }
}

export function clearSelection() {
  if (!selectedObject) return;

  if (Array.isArray(selectedObject.material)) {
    selectedObject.material.forEach((material) => material.dispose());
    selectedObject.material = originalMaterials;
  } else if (originalMaterials.length > 0) {
    selectedObject.material.dispose();
    selectedObject.material = originalMaterials[0];
  }

  selectedObject = null;
  originalMaterials = [];
}

function disposeModel(model) {
  model.traverse((object) => {
    if (!object.isMesh) return;

    object.geometry?.dispose();

    if (Array.isArray(object.material)) {
      object.material.forEach((material) => material.dispose());
    } else {
      object.material?.dispose();
    }
  });
}

export function resetCamera() {
  if (!currentModel) return;
  centerAndFitModel(currentModel);
}

export function zoomCamera(direction) {
  if (!camera || !controls) return;

  const factor = direction === "in" ? 0.8 : 1.25;

  const offset = camera.position.clone().sub(controls.target);
  offset.multiplyScalar(factor);

  camera.position.copy(controls.target).add(offset);
  controls.update();
}