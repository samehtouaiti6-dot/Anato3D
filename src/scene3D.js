import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, camera, renderer, controls;

let skeletonModel = null;
let brainModel = null;
let organsModel = null;
let pancreasModel = null;
let endocrineModel = null;

let selectedBone = null;
let previousMaterials = null;
let originalCameraPosition = null;
let originalCameraTarget = null;
let infoCard = null;

let detailModal = null;
let detailScene = null;
let detailCamera = null;
let detailRenderer = null;
let detailControls = null;
let detailModel = null;

const ORGAN_OFFSET_Y = 0.85;

const ORGAN_NAMES = [
  "heart",
  "cardiac",
  "lung",
  "liver",
  "stomach",
  "kidney",
  "renal",
  "intestine",
  "bowel",
  "trachea",
  "bronch",
  "artery",
  "vein",
  "aorta",
  "vena cava",
  "pulmonary trunk",
  "brain",
];

const anatomyInfo = {
  brain: [
    "Cerveau",
    "Le cerveau est l'organe principal du système nerveux central. Il est constitué de deux hémisphères et de nombreuses structures spécialisées.",
    "Dans la boîte crânienne, protégé par les os du crâne et les méninges.",
    "Il traite les informations sensorielles, commande les mouvements volontaires et intervient dans la mémoire, le langage, les émotions et la pensée.",
  ],
  heart: [
    "Cœur",
    "Le cœur est un organe musculaire creux constitué de quatre cavités : deux oreillettes et deux ventricules.",
    "Dans le thorax, entre les deux poumons, légèrement orienté vers la gauche.",
    "Il assure la circulation sanguine en propulsant le sang vers les poumons et les différents organes du corps.",
  ],
  lungLeft: [
    "Poumon gauche",
    "Le poumon gauche est constitué de deux lobes.",
    "Dans la partie gauche de la cage thoracique.",
    "Il assure les échanges gazeux : absorption de l'oxygène et élimination du dioxyde de carbone.",
  ],
  lungRight: [
    "Poumon droit",
    "Le poumon droit est constitué de trois lobes.",
    "Dans la partie droite de la cage thoracique.",
    "Il assure les échanges gazeux entre l'air et le sang au niveau des alvéoles pulmonaires.",
  ],
  liver: [
    "Foie",
    "Le foie est une volumineuse glande qui participe à de nombreuses fonctions métaboliques.",
    "Dans la partie supérieure droite de l'abdomen, sous le diaphragme.",
    "Il produit la bile, transforme les nutriments, participe à la détoxification du sang et stocke certaines réserves énergétiques.",
  ],
  kidneyLeft: [
    "Rein gauche",
    "Le rein gauche est un organe en forme de haricot appartenant à l'appareil urinaire.",
    "Dans la région postérieure de l'abdomen, à gauche de la colonne vertébrale.",
    "Il filtre le sang, élimine les déchets et participe à la régulation de l'eau, des électrolytes et de la pression artérielle.",
  ],
  kidneyRight: [
    "Rein droit",
    "Le rein droit est un organe en forme de haricot appartenant à l'appareil urinaire.",
    "Dans la région postérieure de l'abdomen, à droite de la colonne vertébrale.",
    "Il filtre le sang, élimine les déchets et produit l'urine. Il participe également à l'équilibre hydrique et à la régulation de la pression artérielle.",
  ],
  stomach: [
    "Estomac",
    "L'estomac est un organe musculaire creux qui reçoit les aliments provenant de l'œsophage.",
    "Dans la partie supérieure de l'abdomen, principalement à gauche.",
    "Il stocke temporairement les aliments, les mélange aux sucs gastriques et commence leur digestion.",
  ],
  smallIntestine: [
    "Intestin grêle",
    "L'intestin grêle comprend le duodénum, le jéjunum et l'iléon.",
    "Dans la partie centrale et inférieure de l'abdomen.",
    "Il assure la majeure partie de la digestion et de l'absorption des nutriments.",
  ],
  largeIntestine: [
    "Gros intestin",
    "Le gros intestin comprend notamment le cæcum, le côlon et le rectum.",
    "Il entoure en grande partie l'intestin grêle dans l'abdomen.",
    "Il absorbe une partie de l'eau et des électrolytes et participe à la formation des selles.",
  ],
  trachea: [
    "Trachée",
    "La trachée est un conduit respiratoire maintenu ouvert par des anneaux cartilagineux.",
    "Dans le cou et la partie supérieure du thorax.",
    "Elle transporte l'air vers les bronches et contribue à son humidification et à sa filtration.",
  ],
  bronchus: [
    "Bronches",
    "Les bronches sont les deux principales branches de division de la trachée.",
    "Dans le thorax, à l'intérieur des poumons.",
    "Elles conduisent et distribuent l'air vers les différentes régions pulmonaires.",
  ],
  bloodVessels: [
    "Vaisseaux sanguins",
    "Les vaisseaux sanguins comprennent les artères et les veines.",
    "Dans l'ensemble du corps.",
    "Les artères transportent le sang depuis le cœur et les veines ramènent le sang vers le cœur.",
  ],
  pancreas: [
    "Pancréas",
    "Le pancréas est une glande mixte constituée d'une partie exocrine et d'une partie endocrine.",
    "Dans la partie supérieure de l'abdomen, derrière l'estomac.",
    "Il produit des enzymes digestives et des hormones, notamment l'insuline et le glucagon, qui participent à la régulation de la glycémie.",
  ],
  thyroid: [
    "Thyroïde",
    "La thyroïde est une glande endocrine située à la base du cou.",
    "À l'avant du cou, devant la trachée.",
    "Elle produit les hormones T3 et T4 qui participent à la régulation du métabolisme.",
  ],
  pituitary: [
    "Hypophyse",
    "L'hypophyse est une petite glande endocrine située à la base du cerveau.",
    "Dans la selle turcique de l'os sphénoïde.",
    "Elle sécrète plusieurs hormones et participe au contrôle d'autres glandes endocrines.",
  ],
  adrenal: [
    "Glandes surrénales",
    "Les glandes surrénales sont deux petites glandes endocrines.",
    "Au-dessus de chaque rein.",
    "Elles produisent notamment le cortisol, l'aldostérone et des catécholamines.",
  ],
  parathyroid: [
    "Parathyroïdes",
    "Les parathyroïdes sont généralement quatre petites glandes endocrines.",
    "À la face postérieure de la thyroïde.",
    "Elles sécrètent la parathormone, qui participe à la régulation du calcium sanguin.",
  ],
  pineal: [
    "Glande pinéale",
    "La glande pinéale est une petite structure endocrine du cerveau.",
    "Dans la région épithalamique du cerveau.",
    "Elle produit la mélatonine et participe à la régulation du rythme veille-sommeil.",
  ],
  femur: [
    "Fémur",
    "Le fémur est le plus long et le plus robuste des os du corps humain.",
    "Dans la cuisse, entre l'os coxal et le tibia.",
    "Il supporte le poids du corps et participe aux mouvements de la hanche et du genou.",
  ],
  tibia: [
    "Tibia",
    "Le tibia est un os long et résistant.",
    "Dans la partie médiale de la jambe, entre le genou et la cheville.",
    "Il supporte une grande partie du poids du corps.",
  ],
  fibula: [
    "Fibula (péroné)",
    "La fibula est un os long et fin situé parallèlement au tibia.",
    "Sur le côté latéral de la jambe.",
    "Elle participe à la stabilité de la cheville.",
  ],
  humerus: [
    "Humérus",
    "L'humérus est un os long du membre supérieur.",
    "Dans le bras, entre l'épaule et le coude.",
    "Il permet les mouvements du bras.",
  ],
  radius: [
    "Radius",
    "Le radius est un os long de l'avant-bras situé du côté du pouce.",
    "Dans l'avant-bras.",
    "Il participe aux mouvements de rotation de l'avant-bras et du poignet.",
  ],
  ulna: [
    "Ulna (cubitus)",
    "L'ulna est un os long de l'avant-bras.",
    "Dans l'avant-bras, du côté du petit doigt.",
    "Il participe principalement à la formation et à la stabilité de l'articulation du coude.",
  ],
  clavicle: [
    "Clavicule",
    "La clavicule est un os long légèrement courbé.",
    "À la partie supérieure du thorax, entre le sternum et l'omoplate.",
    "Elle maintient l'épaule et transmet les forces du membre supérieur vers le tronc.",
  ],
  scapula: [
    "Omoplate",
    "La scapula est un os plat de forme triangulaire.",
    "À l'arrière du thorax, au niveau de l'épaule.",
    "Elle participe aux mouvements de l'épaule.",
  ],
  sternum: [
    "Sternum",
    "Le sternum est un os plat situé au centre de la cage thoracique.",
    "Au centre de la partie antérieure du thorax.",
    "Il participe à la protection des organes thoraciques et à l'attachement des côtes.",
  ],
  rib: [
    "Côte",
    "Les côtes sont des os courbés qui forment une grande partie de la cage thoracique.",
    "Dans la cage thoracique.",
    "Elles protègent notamment le cœur et les poumons et participent à la respiration.",
  ],
  vertebra: [
    "Vertèbre",
    "Une vertèbre est constituée d'un corps vertébral et d'un arc vertébral.",
    "Dans la colonne vertébrale.",
    "Les vertèbres soutiennent le corps et protègent la moelle épinière.",
  ],
  neurocranium: [
    "Boîte crânienne",
    "La boîte crânienne constitue la partie du crâne qui entoure l'encéphale.",
    "Dans la partie supérieure et postérieure du crâne.",
    "Elle protège le cerveau contre les chocs et les traumatismes.",
  ],
  skull: [
    "Crâne",
    "Le crâne est une structure osseuse complexe composée de plusieurs os.",
    "À la partie supérieure du corps.",
    "Il protège le cerveau et soutient les structures du visage.",
  ],
  mandible: [
    "Mandibule",
    "La mandibule constitue la mâchoire inférieure.",
    "Dans la partie inférieure du visage.",
    "Elle permet la mastication et participe à la parole.",
  ],
  pelvis: [
    "Os coxal",
    "L'os coxal est un os large du bassin.",
    "Dans le bassin, de chaque côté du sacrum.",
    "Il transmet le poids du tronc aux membres inférieurs et protège les organes pelviens.",
  ],
  patella: [
    "Rotule",
    "La patella est un petit os sésamoïde situé dans le tendon du quadriceps.",
    "À l'avant de l'articulation du genou.",
    "Elle protège l'articulation du genou.",
  ],
  sacrum: [
    "Sacrum",
    "Le sacrum est un os triangulaire formé par la fusion de cinq vertèbres sacrées.",
    "À la base de la colonne vertébrale.",
    "Il transmet le poids du corps au bassin.",
  ],
  coccyx: [
    "Coccyx",
    "Le coccyx est un petit os situé à l'extrémité inférieure de la colonne vertébrale.",
    "À l'extrémité inférieure de la colonne vertébrale.",
    "Il sert notamment de point d'attache à certains muscles et ligaments.",
  ],
  calcaneus: [
    "Calcanéus",
    "Le calcanéus est le plus grand os du tarse.",
    "À l'arrière du pied.",
    "Il supporte une partie des forces exercées lors de la marche.",
  ],
  talus: [
    "Talus",
    "Le talus est un os du tarse qui s'articule avec le tibia et la fibula.",
    "Dans la partie supérieure du pied, au niveau de la cheville.",
    "Il transmet le poids du corps de la jambe vers le pied.",
  ],
  hyoid: [
    "Os hyoïde",
    "L'os hyoïde est un petit os en forme de U.",
    "Dans la région antérieure du cou.",
    "Il participe à la déglutition, à la phonation et au soutien de la langue.",
  ],
};

function getOrganInfo(name) {
  const n = name.toLowerCase().replace(/[_-]/g, " ");

  if (n.includes("heart") || n.includes("coronary") || n.includes("cardiac"))
    return anatomyInfo.heart;

  if (
    n.includes("left lung") ||
    n.includes("lung left") ||
    n.includes("left pulmonary")
  )
    return anatomyInfo.lungLeft;

  if (
    n.includes("right lung") ||
    n.includes("lung right") ||
    n.includes("right pulmonary")
  )
    return anatomyInfo.lungRight;

  if (n.includes("lung")) return anatomyInfo.lungRight;

  if (
    n.includes("left kidney") ||
    n.includes("kidney left") ||
    n.includes("left renal") ||
    n.includes("renal left")
  )
    return anatomyInfo.kidneyLeft;

  if (
    n.includes("right kidney") ||
    n.includes("kidney right") ||
    n.includes("right renal") ||
    n.includes("renal right")
  )
    return anatomyInfo.kidneyRight;

  if (n.includes("kidney") || n.includes("renal"))
    return anatomyInfo.kidneyLeft;
  if (n.includes("liver")) return anatomyInfo.liver;
  if (n.includes("stomach")) return anatomyInfo.stomach;

  if (
    n.includes("small bowel") ||
    n.includes("small intestine") ||
    n.includes("convoluted")
  )
    return anatomyInfo.smallIntestine;

  if (
    n.includes("large intestine") ||
    n.includes("cecum") ||
    n.includes("colon") ||
    n.includes("rectal")
  )
    return anatomyInfo.largeIntestine;

  if (n.includes("intestine") || n.includes("bowel"))
    return anatomyInfo.smallIntestine;
  if (n.includes("trache")) return anatomyInfo.trachea;
  if (n.includes("bronch")) return anatomyInfo.bronchus;

  if (
    n.includes("artery") ||
    n.includes("vein") ||
    n.includes("aorta") ||
    n.includes("vena cava") ||
    n.includes("pulmonary trunk")
  )
    return anatomyInfo.bloodVessels;

  if (n.includes("pancreas")) return anatomyInfo.pancreas;

  return null;
}

function getEndocrineInfo(name) {
  const n = name.toLowerCase();

  if (n.includes("thyroid")) return anatomyInfo.thyroid;
  if (n.includes("pituitary") || n.includes("hypophysis"))
    return anatomyInfo.pituitary;
  if (n.includes("adrenal") || n.includes("suprarenal"))
    return anatomyInfo.adrenal;
  if (n.includes("parathyroid")) return anatomyInfo.parathyroid;
  if (n.includes("pineal")) return anatomyInfo.pineal;
  if (n.includes("pancreas")) return anatomyInfo.pancreas;

  return [
    "Glande endocrine",
    "Cette structure appartient au système endocrinien.",
    "Sa localisation dépend de la glande représentée.",
    "Les glandes endocrines produisent des hormones libérées dans le sang.",
  ];
}

function getBoneInfo(name) {
  const n = name.toLowerCase();

  if (n.includes("brain") || n.includes("cerebr")) return anatomyInfo.brain;
  if (n.includes("femur")) return anatomyInfo.femur;
  if (n.includes("tibia")) return anatomyInfo.tibia;
  if (n.includes("fibula")) return anatomyInfo.fibula;
  if (n.includes("humerus")) return anatomyInfo.humerus;
  if (n.includes("radius")) return anatomyInfo.radius;
  if (n.includes("ulna")) return anatomyInfo.ulna;
  if (n.includes("clavicle")) return anatomyInfo.clavicle;
  if (n.includes("scapula")) return anatomyInfo.scapula;
  if (n.includes("sternum")) return anatomyInfo.sternum;
  if (n.includes("rib") || n.includes("costal")) return anatomyInfo.rib;
  if (n.includes("vertebra") || n.includes("atlas") || n.includes("axis"))
    return anatomyInfo.vertebra;
  if (n.includes("neurocranium")) return anatomyInfo.neurocranium;
  if (n.includes("skull")) return anatomyInfo.skull;
  if (n.includes("mandible")) return anatomyInfo.mandible;
  if (n.includes("os coxae")) return anatomyInfo.pelvis;
  if (n.includes("patella")) return anatomyInfo.patella;
  if (n.includes("sacrum")) return anatomyInfo.sacrum;
  if (n.includes("coccyx")) return anatomyInfo.coccyx;
  if (n.includes("calcaneus")) return anatomyInfo.calcaneus;
  if (n.includes("talus")) return anatomyInfo.talus;
  if (n.includes("hyoid")) return anatomyInfo.hyoid;

  if (n.includes("tooth")) {
    return [
      "Dent",
      "Structure minéralisée composée principalement d'émail, de dentine et de pulpe.",
      "Dans les mâchoires supérieure et inférieure.",
      "Il permet de couper, déchirer et broyer les aliments.",
    ];
  }

  if (n.includes("phalanx")) {
    return [
      "Phalange",
      "Petit os constituant les doigts ou les orteils.",
      "Dans les doigts des mains ou les orteils des pieds.",
      "Elle permet les mouvements et la préhension.",
    ];
  }

  if (n.includes("metacarpal")) {
    return [
      "Métacarpien",
      "Os long constituant la partie moyenne de la main.",
      "Entre les os du carpe et les phalanges.",
      "Il participe à la structure de la main et aux mouvements des doigts.",
    ];
  }

  if (n.includes("metatarsal")) {
    return [
      "Métatarsien",
      "Os long constituant la partie moyenne du pied.",
      "Entre les os du tarse et les phalanges des orteils.",
      "Il participe au soutien du poids du corps et à la marche.",
    ];
  }

  if (
    [
      "capitate",
      "hamate",
      "lunate",
      "scaphoid",
      "pisiform",
      "trapezium",
      "trapezoid",
      "triquetrum",
    ].some((word) => n.includes(word))
  ) {
    return [
      "Os du carpe",
      "Petit os appartenant au groupe des os du carpe.",
      "Dans le poignet, entre l'avant-bras et les métacarpiens.",
      "Il participe à la mobilité et à la stabilité du poignet.",
    ];
  }

  if (
    n.includes("cuneiform") ||
    n.includes("cuboid") ||
    n.includes("navicular")
  ) {
    return [
      "Os du tarse",
      "Os appartenant au groupe des os du tarse.",
      "Dans la partie postérieure ou moyenne du pied.",
      "Il contribue à la stabilité et au maintien des arches du pied.",
    ];
  }

  return [
    "Os du squelette",
    "Cet élément fait partie du système squelettique humain.",
    "Dans le squelette humain.",
    "Il participe à la structure, au soutien ou à la protection du corps.",
  ];
}

function isOrgan(name) {
  return ORGAN_NAMES.some((keyword) => name.toLowerCase().includes(keyword));
}

// DIAGNOSTIC AUTOMATIQUE DES MODÈLES GLB

function diagnoseModel(model, modelName) {
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  box.getSize(size);

  console.group("ANATO3D - Diagnostic : " + modelName);

  console.log("Centre :", {
    x: center.x.toFixed(3),
    y: center.y.toFixed(3),
    z: center.z.toFixed(3),
  });

  console.log("Dimensions :", {
    largeur: size.x.toFixed(3),
    hauteur: size.y.toFixed(3),
    profondeur: size.z.toFixed(3),
  });

  let meshCount = 0;

  model.traverse((object) => {
    if (!object.isMesh) return;

    meshCount++;

    const meshBox = new THREE.Box3().setFromObject(object);
    const meshSize = meshBox.getSize(new THREE.Vector3());

    console.log("Mesh :", object.name || "Sans nom", {
      dimensions: {
        x: meshSize.x.toFixed(3),
        y: meshSize.y.toFixed(3),
        z: meshSize.z.toFixed(3),
      },
    });
  });

  console.log("Nombre total de meshes :", meshCount);
  console.groupEnd();
}

// CARTE D'INFORMATION

function createInfoCard(container) {
  const card = document.createElement("div");

  Object.assign(card.style, {
    position: "absolute",
    top: "15px",
    right: "15px",
    width: "280px",
    maxWidth: "calc(100% - 30px)",
    boxSizing: "border-box",
    padding: "20px",
    background: "white",
    borderRadius: "14px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
    fontFamily: "Arial, sans-serif",
    zIndex: "30",
    display: "none",
  });

  card.innerHTML = `
    <div style="color:#168b9b;font-size:12px;font-weight:bold;">
      ANATO3D — ANATOMIE
    </div>
    <h3 id="bone-title" style="
      color:#183b56;font-size:22px;margin:12px 0 18px;
    "></h3>
    <button id="read-more" style="
      width:100%;padding:12px;background:#168b9b;color:white;
      border:0;border-radius:8px;font-weight:bold;font-size:14px;
      cursor:pointer;margin-bottom:9px;
    ">Lire plus</button>
    <button id="close-bone-card" style="
      width:100%;padding:10px;background:#eaf0f4;color:#183b56;
      border:0;border-radius:8px;cursor:pointer;font-size:14px;
    ">Fermer</button>
  `;

  container.appendChild(card);

  card.querySelector("#read-more").addEventListener("click", () => {
    if (selectedBone) openBoneDetails(selectedBone);
  });

  card.querySelector("#close-bone-card").addEventListener("click", () => {
    card.style.display = "none";
    closeDetailModal();
    restoreSelectedBone();
  });

  return card;
}

// FENÊTRE DÉTAILLÉE

function createDetailModal(container) {
  const modal = document.createElement("div");

  Object.assign(modal.style, {
    position: "absolute",
    inset: "0",
    background: "rgba(10,25,40,0.78)",
    zIndex: "100",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    boxSizing: "border-box",
  });

  modal.innerHTML = `
    <div id="detail-panel" style="
      width:100%;max-width:950px;max-height:100%;overflow-y:auto;
      background:#ffffff;border-radius:18px;padding:24px;
      box-sizing:border-box;font-family:Arial,sans-serif;
      box-shadow:0 10px 40px rgba(0,0,0,0.3);
    ">
      <div style="
        display:flex;justify-content:space-between;align-items:center;
        gap:12px;margin-bottom:18px;
      ">
        <div>
          <div style="
            color:#168b9b;font-size:12px;font-weight:bold;
            letter-spacing:1px;
          ">ANATO3D — ATLAS ANATOMIQUE</div>
          <h2 id="detail-title" style="
            color:#183b56;font-size:26px;margin:8px 0 0;
          "></h2>
        </div>
        <button id="detail-close" style="
          border:0;background:#eaf0f4;color:#183b56;border-radius:50%;
          width:40px;height:40px;font-size:22px;cursor:pointer;
          flex-shrink:0;
        ">×</button>
      </div>

      <div style="
        display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
        gap:22px;
      ">
        <div>
          <div style="
            color:#168b9b;font-weight:bold;font-size:14px;margin-bottom:10px;
          ">MODÈLE 3D INTERACTIF</div>
          <div id="detail-viewer" style="
            width:100%;height:380px;background:#f1f6fb;
            border-radius:14px;overflow:hidden;position:relative;
          "></div>
          <p style="
            color:#8995a1;font-size:12px;text-align:center;margin-top:10px;
          ">
            Faites glisser pour tourner le modèle et utilisez la molette pour zoomer.
          </p>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="padding:16px;background:#f1f8fa;border-radius:12px;">
            <h3 style="color:#168b9b;font-size:15px;margin:0 0 9px;">
              DESCRIPTION ANATOMIQUE
            </h3>
            <p id="detail-description" style="
              color:#526273;font-size:14px;line-height:1.8;margin:0;
              overflow-wrap:anywhere;
            "></p>
          </div>

          <div style="padding:16px;background:#f1f8fa;border-radius:12px;">
            <h3 style="color:#168b9b;font-size:15px;margin:0 0 9px;">
              EMPLACEMENT
            </h3>
            <p id="detail-location" style="
              color:#526273;font-size:14px;line-height:1.8;margin:0;
            "></p>
          </div>

          <div style="padding:16px;background:#f1f8fa;border-radius:12px;">
            <h3 style="color:#168b9b;font-size:15px;margin:0 0 9px;">
              RÔLE ET FONCTION
            </h3>
            <p id="detail-function" style="
              color:#526273;font-size:14px;line-height:1.8;margin:0;
            "></p>
          </div>

          <div style="padding:12px;background:#f8f9fa;border-radius:10px;">
            <p id="detail-original" style="
              color:#8995a1;font-size:11px;line-height:1.6;margin:0;
              overflow-wrap:anywhere;
            "></p>
          </div>
        </div>
      </div>

      <button id="detail-close-bottom" style="
        width:100%;margin-top:20px;padding:12px;background:#168b9b;
        color:white;border:0;border-radius:8px;font-weight:bold;
        cursor:pointer;font-size:14px;
      ">Fermer la fiche anatomique</button>
    </div>
  `;

  container.appendChild(modal);

  modal
    .querySelector("#detail-close")
    .addEventListener("click", closeDetailModal);
  modal
    .querySelector("#detail-close-bottom")
    .addEventListener("click", closeDetailModal);

  return modal;
}

function openBoneDetails(object) {
  if (!object || !detailModal) return;

  const info = object.userData.anatoInfo || getBoneInfo(object.name);

  detailModal.querySelector("#detail-title").textContent = info[0];
  detailModal.querySelector("#detail-description").textContent = info[1];
  detailModal.querySelector("#detail-location").textContent = info[2];
  detailModal.querySelector("#detail-function").textContent = info[3];
  detailModal.querySelector("#detail-original").textContent =
    "Nom du modèle 3D : " + object.name;

  detailModal.style.display = "flex";
  createIndividualBoneViewer(object);
}

// VISUALISATION INDIVIDUELLE

function createIndividualBoneViewer(object) {
  disposeIndividualViewer();

  const viewer = detailModal.querySelector("#detail-viewer");

  detailScene = new THREE.Scene();
  detailScene.background = new THREE.Color(0xf1f6fb);

  detailCamera = new THREE.PerspectiveCamera(
    40,
    viewer.clientWidth / viewer.clientHeight,
    0.001,
    100
  );

  detailRenderer = new THREE.WebGLRenderer({ antialias: true });
  detailRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  detailRenderer.setSize(viewer.clientWidth, viewer.clientHeight);
  detailRenderer.outputColorSpace = THREE.SRGBColorSpace;
  detailRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  detailRenderer.toneMappingExposure = 1.2;

  viewer.appendChild(detailRenderer.domElement);

  detailControls = new OrbitControls(detailCamera, detailRenderer.domElement);
  detailControls.enableDamping = true;
  detailControls.enableZoom = true;
  detailControls.enablePan = true;

  detailScene.add(new THREE.AmbientLight(0xffffff, 2));

  const light1 = new THREE.DirectionalLight(0xffffff, 3);
  light1.position.set(3, 5, 4);
  detailScene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 2);
  light2.position.set(-3, 3, -4);
  detailScene.add(light2);

  object.updateWorldMatrix(true, true);
  detailModel = object.clone(true);

  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();

  object.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

  detailModel.position.copy(worldPosition);
  detailModel.quaternion.copy(worldQuaternion);
  detailModel.scale.copy(worldScale);

  detailModel.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const copies = materials.map((material) => {
      const copy = material.clone();

      if (copy.color) copy.color.set(0xe2d2b5);

      if (copy.emissive) {
        copy.emissive.set(0x000000);
        copy.emissiveIntensity = 0;
      }

      return copy;
    });

    child.material = Array.isArray(child.material) ? copies : copies[0];
  });

  const group = new THREE.Group();
  group.add(detailModel);
  detailScene.add(group);

  const box = new THREE.Box3().setFromObject(detailModel);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  box.getSize(size);
  group.position.sub(center);

  const maxDimension = Math.max(size.x, size.y, size.z);
  const distance = Math.max(maxDimension * 2.8, 0.5);

  detailCamera.position.set(distance * 0.8, distance * 0.45, distance * 1.8);

  detailControls.target.set(0, 0, 0);
  detailControls.minDistance = Math.max(maxDimension * 0.5, 0.05);
  detailControls.maxDistance = Math.max(maxDimension * 8, 2);
  detailControls.update();
}

function disposeIndividualViewer() {
  if (detailControls) {
    detailControls.dispose();
    detailControls = null;
  }

  if (detailRenderer) {
    detailRenderer.dispose();

    const canvas = detailRenderer.domElement;
    if (canvas.parentElement) canvas.parentElement.removeChild(canvas);

    detailRenderer = null;
  }

  if (detailScene) {
    detailScene.traverse((object) => {
      if (object.isMesh && object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => material.dispose());
      }
    });

    detailScene = null;
  }

  detailCamera = null;
  detailModel = null;
}

function closeDetailModal() {
  if (detailModal) detailModal.style.display = "none";
  disposeIndividualViewer();
}

// BOUTONS DE ZOOM

function createZoomButtons(container) {
  const panel = document.createElement("div");

  Object.assign(panel.style, {
    position: "absolute",
    top: "15px",
    left: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: "20",
  });

  function makeButton(label, action) {
    const button = document.createElement("button");
    button.textContent = label;

    Object.assign(button.style, {
      padding: "10px 14px",
      border: "none",
      borderRadius: "8px",
      background: "#168b9b",
      color: "white",
      fontSize: "13px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
    });

    button.addEventListener("click", action);
    panel.appendChild(button);
  }

  makeButton("Vue complète du squelette", () => {
    if (!skeletonModel) return;

    closeDetailModal();
    restoreSelectedBone();
    infoCard.style.display = "none";

    const box = new THREE.Box3().setFromObject(skeletonModel);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);

    const distance = Math.max(size.x, size.y, size.z) * 1.8;

    camera.position.set(
      center.x + distance * 0.55,
      center.y + distance * 0.2,
      center.z + distance
    );

    controls.target.copy(center);
    controls.update();
  });

  makeButton("＋ Zoom avant", () => {
    const direction = camera.position.clone().sub(controls.target);

    if (direction.length() > 0.25) {
      camera.position.copy(
        controls.target.clone().add(direction.multiplyScalar(0.8))
      );
    }
  });

  makeButton("－ Zoom arrière", () => {
    const direction = camera.position.clone().sub(controls.target);

    if (direction.length() < 8) {
      camera.position.copy(
        controls.target.clone().add(direction.multiplyScalar(1.25))
      );
    }
  });

  container.appendChild(panel);
}

// SÉLECTION ET RESTAURATION

function restoreSelectedBone() {
  if (selectedBone) {
    selectedBone.material = previousMaterials;
    selectedBone = null;
    previousMaterials = null;
  }

  if (originalCameraPosition && originalCameraTarget) {
    camera.position.copy(originalCameraPosition);
    controls.target.copy(originalCameraTarget);
    controls.update();

    originalCameraPosition = null;
    originalCameraTarget = null;
  }
}

function showBoneInfo(name, customInfo = null) {
  const info = customInfo || getBoneInfo(name);

  infoCard.querySelector("#bone-title").textContent = info[0];
  infoCard.style.display = "block";
}

function selectBone(object) {
  if (!object || !object.isMesh) return;

  closeDetailModal();
  restoreSelectedBone();

  selectedBone = object;
  previousMaterials = object.material;

  const materials = Array.isArray(object.material)
    ? object.material
    : [object.material];

  const highlighted = materials.map((material) => {
    const copy = material.clone();

    if (copy.color) copy.color.set(0x00c8e0);

    if (copy.emissive) {
      copy.emissive.set(0x007f99);
      copy.emissiveIntensity = 1.5;
    }

    return copy;
  });

  object.material = Array.isArray(object.material)
    ? highlighted
    : highlighted[0];

  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const sphere = new THREE.Sphere();

  box.getCenter(center);
  box.getBoundingSphere(sphere);

  originalCameraPosition = camera.position.clone();
  originalCameraTarget = controls.target.clone();

  const direction = camera.position.clone().sub(controls.target).normalize();
  const distance = Math.max(sphere.radius * 3.5, 0.35);

  camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
  controls.target.copy(center);
  controls.update();

  showBoneInfo(object.name, object.userData.anatoInfo || null);
}

// INITIALISATION DE LA SCÈNE

export function initScene(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f6fb);

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.01,
    100
  );

  camera.position.set(2.8, 1.55, 3.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.9, 0);
  controls.minDistance = 0.2;
  controls.maxDistance = 8;

  scene.add(new THREE.AmbientLight(0xffffff, 2));

  const light1 = new THREE.DirectionalLight(0xffffff, 3);
  light1.position.set(3, 5, 4);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 2);
  light2.position.set(-3, 3, -4);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffffff, 1);
  light3.position.set(0, 1, 5);
  scene.add(light3);

  const grid = new THREE.GridHelper(4, 20);
  scene.add(grid);

  infoCard = createInfoCard(container);
  detailModal = createDetailModal(container);
  createZoomButtons(container);

  loadModels();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 1. CERVEAU
    if (brainModel) {
      const hits = raycaster.intersectObject(brainModel, true);
      const hit = hits.find(
        (item) => item.object.isMesh && item.object.visible
      );

      if (hit) {
        hit.object.userData.anatoInfo = anatomyInfo.brain;
        selectBone(hit.object);
        return;
      }
    }

    // 2. ORGANES DU TORSO
    if (organsModel) {
      const hits = raycaster.intersectObject(organsModel, true);
      const hit = hits.find(
        (item) =>
          item.object.isMesh &&
          item.object.visible &&
          getOrganInfo(item.object.name)
      );

      if (hit) {
        hit.object.userData.anatoInfo = getOrganInfo(hit.object.name);
        selectBone(hit.object);
        return;
      }
    }

    // 3. PANCRÉAS
    if (pancreasModel) {
      const hits = raycaster.intersectObject(pancreasModel, true);
      const hit = hits.find(
        (item) => item.object.isMesh && item.object.visible
      );

      if (hit) {
        hit.object.userData.anatoInfo = anatomyInfo.pancreas;
        selectBone(hit.object);
        return;
      }
    }

    // 4. GLANDES ENDOCRINES
    if (endocrineModel) {
      const hits = raycaster.intersectObject(endocrineModel, true);
      const hit = hits.find(
        (item) => item.object.isMesh && item.object.visible
      );

      if (hit) {
        hit.object.userData.anatoInfo = getEndocrineInfo(hit.object.name);
        selectBone(hit.object);
        return;
      }
    }

    // 5. SQUELETTE
    if (skeletonModel) {
      const hits = raycaster.intersectObject(skeletonModel, true);
      const hit = hits.find(
        (item) =>
          item.object.isMesh &&
          item.object.visible &&
          item.object.name &&
          !item.object.name.toLowerCase().includes("full adult skeleton")
      );

      if (hit) {
        hit.object.userData.anatoInfo = getBoneInfo(hit.object.name);
        selectBone(hit.object);
      }
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);

    if (detailRenderer && detailCamera) {
      const viewer = detailModal.querySelector("#detail-viewer");
      detailCamera.aspect = viewer.clientWidth / viewer.clientHeight;
      detailCamera.updateProjectionMatrix();
      detailRenderer.setSize(viewer.clientWidth, viewer.clientHeight);
    }
  });

  animate();
}

// CHARGEMENT DE TOUS LES MODÈLES

function loadModels() {
  const loader = new GLTFLoader();

  // 1. SQUELETTE
  loader.load(
    "/models/skeleton.glb",
    (gltf) => {
      skeletonModel = gltf.scene;
      scene.add(skeletonModel);

      console.log("Squelette chargé !");
      positionBrainIfReady();
    },
    undefined,
    (error) => console.error("Erreur squelette :", error)
  );

  // 2. TORSO ET ORGANES
  loader.load(
    "/models/torso.glb",
    (gltf) => {
      organsModel = gltf.scene;

      let visibleCount = 0;
      let kidneyCount = 0;

      organsModel.traverse((object) => {
        if (!object.isMesh) return;

        object.visible = isOrgan(object.name);

        if (object.visible) {
          const info = getOrganInfo(object.name);

          if (info) {
            object.userData.anatoInfo = info;
            visibleCount++;

            if (
              object.name.toLowerCase().includes("kidney") ||
              object.name.toLowerCase().includes("renal")
            ) {
              kidneyCount++;
              console.log("Mesh de rein détecté :", object.name);
            }
          }
        }
      });

      organsModel.position.set(0, ORGAN_OFFSET_Y, 0);
      scene.add(organsModel);

      console.log("Organes chargés :", visibleCount);
      console.log("Meshes de reins détectés :", kidneyCount);

      if (kidneyCount === 0) {
        console.warn("Aucun mesh de rein reconnu dans torso.glb.");
      }
    },
    undefined,
    (error) => console.error("Erreur organes :", error)
  );

  // 3. CERVEAU
  loader.load(
    "/models/brain.glb",
    (gltf) => {
      brainModel = gltf.scene;

      brainModel.traverse((object) => {
        if (object.isMesh) {
          object.userData.anatoInfo = anatomyInfo.brain;
        }
      });

      scene.add(brainModel);
      positionBrainIfReady();

      console.log("Modèle du cerveau chargé !");
    },
    undefined,
    (error) => console.error("Erreur cerveau :", error)
  );

  // 4. PANCRÉAS INDIVIDUEL
  loader.load(
    "/models/pancreas.glb",
    (gltf) => {
      pancreasModel = gltf.scene;
      pancreasModel.name = "PancreasModel";

      pancreasModel.traverse((object) => {
        if (object.isMesh) {
          object.userData.anatoInfo = anatomyInfo.pancreas;
        }
      });

      scene.add(pancreasModel);
      diagnoseModel(pancreasModel, "PANCRÉAS");

      console.log("Pancréas chargé avec succès !");
    },
    undefined,
    (error) => console.error("Erreur chargement pancréas :", error)
  );

  // 5. GLANDES ENDOCRINES — SANS ENVELOPPE CORPORELLE
  loader.load(
    "/models/endocrine-glands-set.glb",
    (gltf) => {
      endocrineModel = gltf.scene;
      endocrineModel.name = "EndocrineGlandsModel";

      endocrineModel.traverse((object) => {
        if (!object.isMesh) return;

        const meshName = object.name.toLowerCase();

        if (
          meshName.includes("orientation_envelope") ||
          meshName.includes("makehuman_cc0")
        ) {
          object.visible = false;
          console.log("Enveloppe masquée :", object.name);
          return;
        }

        object.visible = true;
        object.userData.anatoInfo = getEndocrineInfo(object.name);
      });

      scene.add(endocrineModel);
      diagnoseModel(endocrineModel, "GLANDES ENDOCRINES");

      console.log("Glandes endocrines chargées sans enveloppe corporelle !");
    },
    undefined,
    (error) => console.error("Erreur chargement glandes endocrines :", error)
  );
} // FIN DE loadModels()

// POSITIONNEMENT DU CERVEAU

function positionBrainIfReady() {
  if (!brainModel || !skeletonModel) return;

  skeletonModel.updateMatrixWorld(true);

  let skull = null;

  skeletonModel.traverse((object) => {
    if (
      !skull &&
      object.name &&
      object.name.toLowerCase().includes("neurocranium")
    ) {
      skull = object;
    }
  });

  if (!skull) {
    console.warn("Boîte crânienne introuvable : position par défaut.");
    brainModel.position.set(0, 1.65, 0);
    return;
  }

  const skullBox = new THREE.Box3().setFromObject(skull);
  const skullCenter = new THREE.Vector3();
  const skullSize = new THREE.Vector3();

  skullBox.getCenter(skullCenter);
  skullBox.getSize(skullSize);

  const brainBox = new THREE.Box3().setFromObject(brainModel);
  const brainCenter = new THREE.Vector3();
  const brainSize = new THREE.Vector3();

  brainBox.getCenter(brainCenter);
  brainBox.getSize(brainSize);

  const scaleX = (skullSize.x * 0.78) / brainSize.x;
  const scaleY = (skullSize.y * 0.72) / brainSize.y;
  const scaleZ = (skullSize.z * 0.68) / brainSize.z;

  const scale = Math.min(scaleX, scaleY, scaleZ);

  brainModel.scale.setScalar(scale);
  brainModel.position.sub(brainCenter.multiplyScalar(scale));

  brainModel.position.add(
    new THREE.Vector3(
      skullCenter.x,
      skullCenter.y + skullSize.y * 0.08,
      skullCenter.z - skullSize.z * 0.04
    )
  );

  brainModel.updateMatrixWorld(true);

  console.log("Cerveau positionné dans la boîte crânienne.");
}

// SÉLECTION D'UN ORGANE DEPUIS UN AUTRE MENU

export function selectOrgan(id) {
  if (!id) return;

  const target = id.toLowerCase();
  const models = [organsModel, pancreasModel, endocrineModel];

  let selected = null;

  for (const model of models) {
    if (!model) continue;

    model.traverse((object) => {
      if (!selected && object.isMesh && object.visible) {
        if (object.name.toLowerCase().includes(target)) {
          selected = object;
        }
      }
    });

    if (selected) break;
  }

  if (selected) {
    if (pancreasModel && pancreasModel.getObjectById(selected.id)) {
      selected.userData.anatoInfo = anatomyInfo.pancreas;
    } else if (endocrineModel && endocrineModel.getObjectById(selected.id)) {
      selected.userData.anatoInfo = getEndocrineInfo(selected.name);
    } else {
      selected.userData.anatoInfo = getOrganInfo(selected.name);
    }

    selectBone(selected);
  } else {
    console.warn("Organe introuvable :", id);
  }
}

// ANIMATION

function animate() {
  requestAnimationFrame(animate);

  if (controls) controls.update();

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  if (detailRenderer && detailScene && detailCamera && detailControls) {
    detailControls.update();
    detailRenderer.render(detailScene, detailCamera);
  }
}
