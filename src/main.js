import "./style.css";

import {
  initScene,
  loadModel,
  resetCamera,
  zoomCamera,
  clearSelection
} from "./scene3D.js";

const $ = (id) => document.getElementById(id);

const models = {
  skeleton: {
    title: "Squelette humain",
    subtitle: "Exploration interactive du système osseux",
    path: "/models/skeleton.glb"
  },

  torso: {
    title: "Organes du torse",
    subtitle: "Exploration des organes thoraciques et abdominaux",
    path: "/models/torso.glb"
  },

  brain: {
    title: "Cerveau humain",
    subtitle: "Exploration du système nerveux central",
    path: "/models/brain.glb"
  },

  pancreas: {
    title: "Pancréas",
    subtitle: "Exploration du système digestif et endocrinien",
    path: "/models/pancreas.glb"
  },

  endocrine: {
    title: "Glandes endocrines",
    subtitle: "Exploration du système hormonal",
    path: "/models/endocrine-glands-set.glb"
  }
};

let currentModel = "skeleton";

/* --------------------------------------------------
   TRADUCTION DES STRUCTURES ANATOMIQUES
-------------------------------------------------- */

const anatomyTranslations = {
  // Squelette
  skeleton: "Squelette humain",
  human_skeleton: "Squelette humain",
  skull: "Crâne",
  cranium: "Boîte crânienne",
  mandible: "Mandibule",
  jaw: "Mâchoire inférieure",
  maxilla: "Maxillaire",
  spine: "Colonne vertébrale",
  vertebral_column: "Colonne vertébrale",
  vertebra: "Vertèbre",
  cervical_vertebra: "Vertèbre cervicale",
  thoracic_vertebra: "Vertèbre thoracique",
  lumbar_vertebra: "Vertèbre lombaire",
  sacrum: "Sacrum",
  coccyx: "Coccyx",
  rib: "Côte",
  ribs: "Côtes",
  sternum: "Sternum",
  clavicle: "Clavicule",
  scapula: "Omoplate",
  shoulder_blade: "Omoplate",
  humerus: "Humérus",
  radius: "Radius",
  ulna: "Ulna",
  carpal: "Os du carpe",
  carpals: "Os du carpe",
  metacarpal: "Métacarpien",
  metacarpals: "Métacarpiens",
  phalanx: "Phalange",
  phalanges: "Phalanges",
  pelvis: "Bassin",
  hip_bone: "Os coxal",
  ilium: "Ilion",
  ischium: "Ischion",
  pubis: "Pubis",
  femur: "Fémur",
  patella: "Rotule",
  kneecap: "Rotule",
  tibia: "Tibia",
  fibula: "Fibula (péroné)",
  tarsal: "Os du tarse",
  tarsals: "Os du tarse",
  metatarsal: "Métatarsien",
  metatarsals: "Métatarsiens",
  calcaneus: "Calcanéum",
  talus: "Talus",
  sacroiliac: "Articulation sacro-iliaque",

  // Organes
  brain: "Cerveau",
  cerebrum: "Cerveau",
  cerebellum: "Cervelet",
  brainstem: "Tronc cérébral",
  heart: "Cœur",
  lung: "Poumon",
  lungs: "Poumons",
  left_lung: "Poumon gauche",
  right_lung: "Poumon droit",
  liver: "Foie",
  stomach: "Estomac",
  pancreas: "Pancréas",
  kidney: "Rein",
  kidneys: "Reins",
  left_kidney: "Rein gauche",
  right_kidney: "Rein droit",
  spleen: "Rate",
  bladder: "Vessie",
  esophagus: "Œsophage",
  trachea: "Trachée",
  small_intestine: "Intestin grêle",
  large_intestine: "Gros intestin",
  colon: "Côlon",
  rectum: "Rectum",
  gallbladder: "Vésicule biliaire",
  thyroid: "Glande thyroïde",
  pituitary: "Hypophyse",
  pituitary_gland: "Hypophyse",
  adrenal: "Glande surrénale",
  adrenal_gland: "Glande surrénale",
  hypothalamus: "Hypothalamus",
  parathyroid: "Glandes parathyroïdes",
  thymus: "Thymus",
  pineal_gland: "Glande pinéale",
  ovaries: "Ovaires",
  testis: "Testicule",
  uterus: "Utérus"
};

function normalizeName(name) {
  return String(name || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\.\d+$/g, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function translateAnatomyName(originalName) {
  const normalized = normalizeName(originalName);

  if (anatomyTranslations[normalized.replace(/\s+/g, "_")]) {
    return anatomyTranslations[normalized.replace(/\s+/g, "_")];
  }

  // Recherche d'un nom anatomique contenu dans le nom du mesh.
  const entries = Object.entries(anatomyTranslations)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [englishName, frenchName] of entries) {
    const key = normalizeName(englishName);

    if (
      normalized === key ||
      normalized.includes(key)
    ) {
      return frenchName;
    }
  }

  return "Structure anatomique";
}

/* --------------------------------------------------
   INFORMATIONS ANATOMIQUES
-------------------------------------------------- */

const anatomyInfo = {
  "Crâne": {
    location: "À la partie supérieure du squelette, au niveau de la tête.",
    function: "Protège l'encéphale et soutient les structures du visage.",
    role: "Structure osseuse de protection du système nerveux central."
  },

  "Mandibule": {
    location: "Partie inférieure du visage.",
    function: "Permet les mouvements de la mâchoire.",
    role: "Intervient dans la mastication et la parole."
  },

  "Colonne vertébrale": {
    location: "Le long du dos, du cou jusqu'au bassin.",
    function: "Soutient le corps et protège la moelle épinière.",
    role: "Assure la stabilité et la mobilité du tronc."
  },

  "Vertèbre": {
    location: "Dans la colonne vertébrale.",
    function: "Participe au soutien du corps et à la protection de la moelle épinière.",
    role: "Élément osseux constituant la colonne vertébrale."
  },

  "Côtes": {
    location: "Dans la cage thoracique.",
    function: "Protègent le cœur et les poumons.",
    role: "Participent aux mouvements respiratoires."
  },

  "Sternum": {
    location: "Au centre de la partie antérieure du thorax.",
    function: "Relie plusieurs côtes et participe à la protection des organes thoraciques.",
    role: "Os central de la cage thoracique."
  },

  "Clavicule": {
    location: "Entre le sternum et l'épaule.",
    function: "Relie le membre supérieur au tronc.",
    role: "Stabilise la région de l'épaule."
  },

  "Omoplate": {
    location: "À l'arrière de l'épaule.",
    function: "Participe aux mouvements de l'épaule.",
    role: "Surface d'attache de plusieurs muscles."
  },

  "Humérus": {
    location: "Dans le bras, entre l'épaule et le coude.",
    function: "Participe aux mouvements du membre supérieur.",
    role: "Os long du bras."
  },

  "Radius": {
    location: "Dans l'avant-bras, du côté du pouce.",
    function: "Participe aux mouvements du poignet et de l'avant-bras.",
    role: "Os latéral de l'avant-bras."
  },

  "Ulna": {
    location: "Dans l'avant-bras, du côté du petit doigt.",
    function: "Participe à la stabilité du coude.",
    role: "Os médial de l'avant-bras."
  },

  "Fémur": {
    location: "Dans la cuisse, entre la hanche et le genou.",
    function: "Supporte une grande partie du poids du corps.",
    role: "Os long de la cuisse."
  },

  "Rotule": {
    location: "À l'avant de l'articulation du genou.",
    function: "Protège le genou et facilite l'action du quadriceps.",
    role: "Os sésamoïde du genou."
  },

  "Tibia": {
    location: "Dans la jambe, du côté médial.",
    function: "Supporte une grande partie du poids du corps.",
    role: "Principal os porteur de la jambe."
  },

  "Fibula (péroné)": {
    location: "Dans la jambe, du côté latéral.",
    function: "Contribue à la stabilité de la cheville.",
    role: "Os latéral de la jambe."
  },

  "Bassin": {
    location: "À la base du tronc.",
    function: "Transmet le poids du corps vers les membres inférieurs.",
    role: "Protège notamment les organes pelviens."
  },

  "Cerveau": {
    location: "Dans la boîte crânienne.",
    function: "Traite les informations et commande de nombreuses activités de l'organisme.",
    role: "Centre principal de traitement du système nerveux."
  },

  "Cervelet": {
    location: "À l'arrière et en bas de l'encéphale.",
    function: "Coordonne les mouvements et l'équilibre.",
    role: "Participe à la précision des mouvements."
  },

  "Tronc cérébral": {
    location: "Entre le cerveau et la moelle épinière.",
    function: "Régule plusieurs fonctions vitales.",
    role: "Assure la liaison entre le cerveau et la moelle épinière."
  },

  "Cœur": {
    location: "Dans le thorax, entre les deux poumons.",
    function: "Pompe le sang dans la circulation sanguine.",
    role: "Organe central du système cardiovasculaire."
  },

  "Poumon": {
    location: "Dans la cavité thoracique.",
    function: "Assure les échanges gazeux entre l'air et le sang.",
    role: "Organe principal de la respiration."
  },

  "Poumon gauche": {
    location: "Dans la partie gauche de la cavité thoracique.",
    function: "Participe aux échanges gazeux.",
    role: "Organe respiratoire gauche."
  },

  "Poumon droit": {
    location: "Dans la partie droite de la cavité thoracique.",
    function: "Participe aux échanges gazeux.",
    role: "Organe respiratoire droit."
  },

  "Foie": {
    location: "Dans la partie supérieure droite de l'abdomen.",
    function: "Participe au métabolisme, à la détoxification et à la production de bile.",
    role: "Organe majeur du système digestif et métabolique."
  },

  "Estomac": {
    location: "Dans la partie supérieure de l'abdomen.",
    function: "Mélange les aliments et commence leur digestion.",
    role: "Organe du tube digestif."
  },

  "Pancréas": {
    location: "Derrière l'estomac.",
    function: "Produit des enzymes digestives et des hormones comme l'insuline.",
    role: "Organe à fonction digestive et endocrine."
  },

  "Rein": {
    location: "Dans la région postérieure de l'abdomen.",
    function: "Filtre le sang et participe à la production de l'urine.",
    role: "Organe essentiel du système urinaire."
  },

  "Rate": {
    location: "Dans la partie supérieure gauche de l'abdomen.",
    function: "Participe à la défense immunitaire et au renouvellement des cellules sanguines.",
    role: "Organe lymphoïde."
  },

  "Vessie": {
    location: "Dans la partie inférieure du bassin.",
    function: "Stocke temporairement l'urine.",
    role: "Organe du système urinaire."
  },

  "Trachée": {
    location: "Entre le larynx et les bronches.",
    function: "Conduit l'air vers les poumons.",
    role: "Voie respiratoire."
  },

  "Intestin grêle": {
    location: "Dans la cavité abdominale.",
    function: "Assure une grande partie de la digestion et de l'absorption des nutriments.",
    role: "Partie essentielle du système digestif."
  },

  "Gros intestin": {
    location: "Autour de l'intestin grêle.",
    function: "Absorbe l'eau et participe à la formation des selles.",
    role: "Dernière partie principale du tube digestif."
  },

  "Glande thyroïde": {
    location: "À l'avant du cou.",
    function: "Produit des hormones qui régulent notamment le métabolisme.",
    role: "Glande endocrine."
  },

  "Hypophyse": {
    location: "À la base du cerveau.",
    function: "Sécrète des hormones qui régulent plusieurs autres glandes.",
    role: "Glande endocrine de contrôle."
  },

  "Glande surrénale": {
    location: "Au-dessus de chaque rein.",
    function: "Produit notamment le cortisol et l'adrénaline.",
    role: "Participe à la réponse au stress et à l'équilibre hormonal."
  },

  "Hypothalamus": {
    location: "À la base du cerveau.",
    function: "Participe à la régulation hormonale et à l'homéostasie.",
    role: "Fait le lien entre le système nerveux et le système endocrinien."
  },

  "Glandes parathyroïdes": {
    location: "À l'arrière de la thyroïde.",
    function: "Régulent le taux de calcium dans le sang.",
    role: "Glandes endocrines."
  },

  "Thymus": {
    location: "Dans le thorax, derrière le sternum.",
    function: "Participe à la maturation des lymphocytes T.",
    role: "Organe du système immunitaire."
  }
};

/* --------------------------------------------------
   GESTION DES INFORMATIONS
-------------------------------------------------- */

function displayOrganInformation(name) {
  const frenchName = translateAnatomyName(name);

  $("info-title").textContent = frenchName;

  const info = anatomyInfo[frenchName];

  if (info) {
    $("info-description").textContent =
      `Informations anatomiques sur ${frenchName.toLowerCase()}.`;

    $("organ-location").textContent = info.location;
    $("organ-function").textContent = info.function;
    $("organ-role").textContent = info.role;
  } else {
    $("info-description").textContent =
      "Structure détectée dans le modèle 3D. Son nom anatomique exact doit être confirmé à partir du modèle.";

    $("organ-location").textContent = "Information à compléter.";
    $("organ-function").textContent = "Information à compléter.";
    $("organ-role").textContent = "Structure anatomique sélectionnée.";
  }
}

/* --------------------------------------------------
   QUIZ : QUESTIONS PAR MODÈLE
-------------------------------------------------- */

const quizzes = {
  skeleton: [
    {
      question: "Combien d'os compte généralement le squelette d'un adulte ?",
      options: ["106 os", "206 os", "306 os", "406 os"],
      answer: 1,
      explanation: "Le squelette humain adulte compte généralement 206 os."
    },
    {
      question: "Quel os se trouve dans la cuisse ?",
      options: ["Humérus", "Radius", "Fémur", "Tibia"],
      answer: 2,
      explanation: "Le fémur est l'os long situé dans la cuisse."
    },
    {
      question: "Quel est le rôle principal du crâne ?",
      options: [
        "Protéger le cerveau",
        "Filtrer le sang",
        "Produire l'insuline",
        "Permettre la digestion"
      ],
      answer: 0,
      explanation: "Le crâne protège l'encéphale contre les traumatismes."
    },
    {
      question: "Quel os protège le cœur et les poumons avec les côtes ?",
      options: ["Fémur", "Sternum", "Rotule", "Mandibule"],
      answer: 1,
      explanation: "Le sternum est situé à l'avant de la cage thoracique."
    },
    {
      question: "Quel os se trouve dans la jambe et supporte une grande partie du poids du corps ?",
      options: ["Tibia", "Radius", "Clavicule", "Humérus"],
      answer: 0,
      explanation: "Le tibia est le principal os porteur de la jambe."
    }
  ],

  torso: [
    {
      question: "Quel organe pompe le sang dans l'organisme ?",
      options: ["Foie", "Cœur", "Estomac", "Rate"],
      answer: 1,
      explanation: "Le cœur assure la circulation du sang."
    },
    {
      question: "Quel est le rôle principal des poumons ?",
      options: [
        "Digérer les aliments",
        "Filtrer l'urine",
        "Assurer les échanges gazeux",
        "Produire les hormones"
      ],
      answer: 2,
      explanation: "Les poumons assurent les échanges d'oxygène et de dioxyde de carbone."
    },
    {
      question: "Où se trouve principalement le foie ?",
      options: [
        "Dans le thorax gauche",
        "Dans la partie supérieure droite de l'abdomen",
        "Dans le crâne",
        "Dans le bassin"
      ],
      answer: 1,
      explanation: "Le foie se situe principalement dans la partie supérieure droite de l'abdomen."
    },
    {
      question: "Quel organe commence la digestion des aliments ?",
      options: ["Estomac", "Vessie", "Cerveau", "Rein"],
      answer: 0,
      explanation: "L'estomac mélange les aliments et participe à leur digestion."
    },
    {
      question: "Quel organe filtre le sang pour produire l'urine ?",
      options: ["Rate", "Poumon", "Rein", "Pancréas"],
      answer: 2,
      explanation: "Les reins filtrent le sang et produisent l'urine."
    }
  ],

  brain: [
    {
      question: "Où se trouve le cerveau ?",
      options: [
        "Dans la cage thoracique",
        "Dans la boîte crânienne",
        "Dans l'abdomen",
        "Dans le bassin"
      ],
      answer: 1,
      explanation: "Le cerveau est protégé par la boîte crânienne."
    },
    {
      question: "Quel est le rôle du cervelet ?",
      options: [
        "Produire l'insuline",
        "Filtrer le sang",
        "Coordonner les mouvements et l'équilibre",
        "Digérer les aliments"
      ],
      answer: 2,
      explanation: "Le cervelet participe à la coordination des mouvements et à l'équilibre."
    },
    {
      question: "Quelle structure relie le cerveau à la moelle épinière ?",
      options: [
        "Tronc cérébral",
        "Hypophyse",
        "Cervelet",
        "Thyroïde"
      ],
      answer: 0,
      explanation: "Le tronc cérébral assure la liaison avec la moelle épinière."
    },
    {
      question: "Le cerveau appartient à quel système ?",
      options: [
        "Système digestif",
        "Système nerveux",
        "Système urinaire",
        "Système respiratoire"
      ],
      answer: 1,
      explanation: "Le cerveau est un élément central du système nerveux."
    },
    {
      question: "Quelle structure protège le cerveau ?",
      options: ["Sternum", "Bassin", "Crâne", "Côtes"],
      answer: 2,
      explanation: "Le crâne forme une protection osseuse autour de l'encéphale."
    }
  ],

  pancreas: [
    {
      question: "Où se trouve le pancréas ?",
      options: [
        "Derrière l'estomac",
        "Dans le crâne",
        "Dans le thorax",
        "Dans la vessie"
      ],
      answer: 0,
      explanation: "Le pancréas se trouve derrière l'estomac."
    },
    {
      question: "Quelle hormone permet de diminuer la glycémie ?",
      options: ["Adrénaline", "Insuline", "Cortisol", "Thyroxine"],
      answer: 1,
      explanation: "L'insuline contribue à diminuer le taux de glucose sanguin."
    },
    {
      question: "Le pancréas possède-t-il une fonction endocrine ?",
      options: ["Oui", "Non", "Uniquement respiratoire", "Uniquement osseuse"],
      answer: 0,
      explanation: "Le pancréas sécrète des hormones directement dans le sang."
    },
    {
      question: "Quelle substance participe à la digestion ?",
      options: [
        "Les enzymes pancréatiques",
        "L'hémoglobine",
        "La kératine",
        "La mélanine"
      ],
      answer: 0,
      explanation: "Les enzymes pancréatiques participent à la digestion des nutriments."
    },
    {
      question: "Quelle hormone augmente la glycémie ?",
      options: ["Insuline", "Glucagon", "Mélatonine", "Calcitonine"],
      answer: 1,
      explanation: "Le glucagon contribue à augmenter la glycémie."
    }
  ],

  endocrine: [
    {
      question: "Quel est le rôle du système endocrinien ?",
      options: [
        "Produire des hormones",
        "Produire les os",
        "Filtrer l'air",
        "Transporter les aliments"
      ],
      answer: 0,
      explanation: "Le système endocrinien est constitué de glandes qui produisent des hormones."
    },
    {
      question: "Quelle glande se trouve à l'avant du cou ?",
      options: ["Hypophyse", "Thyroïde", "Surrénale", "Thymus"],
      answer: 1,
      explanation: "La thyroïde se situe à l'avant du cou."
    },
    {
      question: "Où se trouvent les glandes surrénales ?",
      options: [
        "Au-dessus des reins",
        "Dans le cerveau",
        "Dans les poumons",
        "Dans l'estomac"
      ],
      answer: 0,
      explanation: "Chaque glande surrénale se trouve au-dessus d'un rein."
    },
    {
      question: "Quelle glande est située à la base du cerveau ?",
      options: ["Thyroïde", "Hypophyse", "Thymus", "Pancréas"],
      answer: 1,
      explanation: "L'hypophyse est située à la base du cerveau."
    },
    {
      question: "Quelle hormone est produite par la glande thyroïde ?",
      options: ["Insuline", "Adrénaline", "Thyroxine", "Glucagon"],
      answer: 2,
      explanation: "La thyroxine (T4) est une hormone produite par la thyroïde."
    }
  ]
};

/* --------------------------------------------------
   GESTION DU QUIZ
-------------------------------------------------- */

let questionIndex = 0;
let score = 0;
let quizStarted = false;
let quizFinished = false;
let answered = false;

function resetQuiz() {
  questionIndex = 0;
  score = 0;
  quizStarted = false;
  quizFinished = false;
  answered = false;

  $("quiz-counter").textContent = `0/${quizzes[currentModel].length}`;
  $("quiz-score").textContent = "0";
  $("question-number").textContent = "PRÊT À COMMENCER";
  $("quiz-question").textContent = "Testez vos connaissances en anatomie.";
  $("quiz-options").innerHTML = "";
  $("quiz-feedback").textContent = "";
  $("quiz-feedback").className = "quiz-feedback";
  $("quiz-instruction").textContent = "Sélectionnez une réponse pour continuer.";
  $("quiz-progress-bar").style.width = "0%";
  $("quiz-next").disabled = false;
  $("quiz-next").innerHTML = 'Commencer le quiz <span>→</span>';
}

function showQuestion() {
  const questions = quizzes[currentModel];
  const question = questions[questionIndex];

  answered = false;

  $("quiz-counter").textContent =
    `${questionIndex + 1}/${questions.length}`;

  $("quiz-score").textContent = String(score);

  $("question-number").textContent =
    `QUESTION ${String(questionIndex + 1).padStart(2, "0")}`;

  $("quiz-question").textContent = question.question;

  $("quiz-progress-bar").style.width =
    `${(questionIndex / questions.length) * 100}%`;

  $("quiz-feedback").textContent = "";
  $("quiz-feedback").className = "quiz-feedback";

  $("quiz-instruction").textContent =
    "Choisissez une seule réponse.";

  $("quiz-options").innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "quiz-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => checkAnswer(index));

    $("quiz-options").appendChild(button);
  });

  $("quiz-next").disabled = true;
  $("quiz-next").textContent = "Valider la suite";
}

function checkAnswer(selectedIndex) {
  if (answered) return;

  answered = true;

  const question = quizzes[currentModel][questionIndex];
  const buttons = [...$("quiz-options").children];

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === question.answer) {
      button.classList.add("correct");
    }

    if (index === selectedIndex && selectedIndex !== question.answer) {
      button.classList.add("incorrect");
    }
  });

  if (selectedIndex === question.answer) {
    score++;

    $("quiz-feedback").textContent =
      `Bonne réponse ! ${question.explanation}`;

    $("quiz-feedback").className = "quiz-feedback correct";
  } else {
    $("quiz-feedback").textContent =
      `Mauvaise réponse. ${question.explanation}`;

    $("quiz-feedback").className = "quiz-feedback incorrect";
  }

  $("quiz-score").textContent = String(score);
  $("quiz-progress-bar").style.width =
    `${((questionIndex + 1) / quizzes[currentModel].length) * 100}%`;

  $("quiz-instruction").textContent =
    "Consultez l'explication avant de continuer.";

  $("quiz-next").disabled = false;

  $("quiz-next").innerHTML =
    questionIndex === quizzes[currentModel].length - 1
      ? "Voir mon résultat →"
      : "Question suivante →";
}

function finishQuiz() {
  quizFinished = true;

  const total = quizzes[currentModel].length;
  const percentage = Math.round((score / total) * 100);

  $("question-number").textContent = "QUIZ TERMINÉ";

  $("quiz-question").textContent =
    `Votre résultat : ${score} / ${total}`;

  $("quiz-options").innerHTML = "";

  $("quiz-feedback").className = "quiz-feedback correct";
  $("quiz-feedback").textContent =
    percentage >= 80
      ? `Excellent travail ! Vous avez obtenu ${percentage} %.`
      : percentage >= 60
        ? `Bon travail ! Vous avez obtenu ${percentage} %. Continuez à vous entraîner.`
        : `Vous avez obtenu ${percentage} %. Révisez les structures anatomiques et réessayez.`;

  $("quiz-progress-bar").style.width = "100%";
  $("quiz-instruction").textContent =
    "Vous pouvez recommencer le quiz.";

  $("quiz-next").disabled = false;
  $("quiz-next").textContent = "Recommencer le quiz";
}

$("quiz-next").addEventListener("click", () => {
  if (!quizStarted) {
    quizStarted = true;
    showQuestion();
    return;
  }

  if (quizFinished) {
    resetQuiz();
    quizStarted = true;
    showQuestion();
    return;
  }

  if (!answered) return;

  if (questionIndex < quizzes[currentModel].length - 1) {
    questionIndex++;
    showQuestion();
  } else {
    finishQuiz();
  }
});

/* --------------------------------------------------
   CHANGEMENT DE MODÈLE
-------------------------------------------------- */

function selectModel(modelKey) {
  if (!models[modelKey]) return;

  currentModel = modelKey;

  document.querySelectorAll(".model-button").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.model === modelKey
    );
  });

  $("model-title").textContent = models[modelKey].title;
  $("model-subtitle").textContent = models[modelKey].subtitle;

  $("loading").classList.remove("hidden");
  $("loading").innerHTML = `
    <div class="loader"></div>
    <strong>Chargement du modèle 3D</strong>
    <span>Veuillez patienter...</span>
  `;

  $("info-title").textContent = "Aucune sélection";
  $("info-description").textContent =
    "Cliquez sur une structure du modèle 3D pour afficher ses informations.";

  $("organ-location").textContent = "—";
  $("organ-function").textContent = "—";
  $("organ-role").textContent = "—";

  resetQuiz();
  clearSelection();

  loadModel(models[modelKey].path, modelKey);
}

document.querySelectorAll(".model-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectModel(button.dataset.model);
  });
});

/* --------------------------------------------------
   COMMANDES DE LA CAMÉRA
-------------------------------------------------- */

$("reset-camera").addEventListener("click", resetCamera);

$("zoom-in").addEventListener("click", () => {
  zoomCamera("in");
});

$("zoom-out").addEventListener("click", () => {
  zoomCamera("out");
});

/* --------------------------------------------------
   INITIALISATION
-------------------------------------------------- */

initScene($("scene-container"), (selection) => {
  displayOrganInformation(selection.name);
});

selectModel("skeleton");