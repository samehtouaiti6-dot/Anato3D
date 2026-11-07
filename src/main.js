import "./style.css";
import { initScene } from "./scene3D.js";
import { organs } from "./data.js";

document.querySelector("#app").innerHTML = `
<header class="topbar">
    <div class="logo">✚ Anato<span>3D</span></div>
    <nav>
        <a href="#home">Accueil</a>
        <a href="#exploration">Exploration 3D</a>
        <a href="#quiz">Quiz</a>
    </nav>
    <div class="header-label">BIOMEDICAL EDUCATION</div>
</header>

<main>
    <section class="hero" id="home">
        <p class="eyebrow">DÉCOUVRIR • EXPLORER • APPRENDRE</p>
        <h1>Explorez le corps humain <span>en 3D.</span></h1>
        <p>Découvrez l'anatomie humaine grâce à une expérience interactive et immersive.</p>
        <a href="#exploration" class="primary-button">Commencer l'exploration →</a>
    </section>

    <section class="workspace" id="exploration">
        <aside class="sidebar">
            <h2>Exploration</h2>
            <p class="muted">Sélectionnez un organe</p>
            <div id="organ-list"></div>
            <div class="help-box">
                <strong>Comment explorer ?</strong>
                <p>Tournez le modèle avec la souris et utilisez la molette pour zoomer.</p>
            </div>
        </aside>

        <section class="viewer">
            <div class="viewer-header">
                <span>● VISUALISATION 3D</span>
                <span>ANATOMIE HUMAINE</span>
            </div>
            <div id="scene-container"></div>
            <div class="viewer-controls">
                Rotation : souris | Zoom : molette
            </div>
        </section>

        <aside class="info-panel">
            <p class="eyebrow">FICHE ANATOMIQUE</p>
            <div id="organ-info">
                <h3>Choisissez un organe</h3>
                <p>Cliquez sur un organe pour découvrir ses informations.</p>
            </div>
        </aside>
    </section>

    <section class="quiz-section" id="quiz">
        <div>
            <p class="eyebrow">APPRENTISSAGE INTERACTIF</p>
            <h2>Testez vos connaissances</h2>
            <p>Découvrez bientôt notre quiz d'anatomie.</p>
        </div>
        <button disabled>Quiz bientôt disponible</button>
    </section>
</main>

<footer>
    Anato3D © 2026–2027 | Projet académique – Génie Biomédical
    <br>INTEK – Université de Jendouba
</footer>
`;

const organList = document.querySelector("#organ-list");
const organInfo = document.querySelector("#organ-info");

function displayOrgan(id) {
  const organ = organs[id];
  if (!organ) return;

  document.querySelectorAll(".organ-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.organ === id);
  });

  organInfo.innerHTML = `
        <div class="organ-icon">${organ.icon}</div>
        <h2>${organ.name}</h2>
        <div class="info-block">
            <h4>Description</h4>
            <p>${organ.description}</p>
        </div>
        <div class="info-block">
            <h4>Localisation</h4>
            <p>${organ.location}</p>
        </div>
        <div class="info-block">
            <h4>Fonction principale</h4>
            <p>${organ.function}</p>
        </div>
    `;

  selectOrgan(id);
}

Object.entries(organs).forEach(([id, organ]) => {
  const button = document.createElement("button");
  button.className = "organ-button";
  button.dataset.organ = id;
  button.textContent = `${organ.icon}  ${organ.name}`;
  button.addEventListener("click", () => displayOrgan(id));
  organList.appendChild(button);
});

initScene(document.querySelector("#scene-container"), displayOrgan);
displayOrgan("heart");
