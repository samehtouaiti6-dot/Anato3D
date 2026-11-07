import { NodeIO } from "@gltf-transform/core";
import { KHRTextureTransform } from "@gltf-transform/extensions";

async function inspectTorso() {
  const io = new NodeIO();

  io.registerExtensions([KHRTextureTransform]);

  const document = await io.read("public/models/torso.glb");
  const root = document.getRoot();

  console.log("\n========== OBJETS DU TORSE ==========\n");

  const names = new Set();

  root.listNodes().forEach((node) => {
    const name = node.getName();

    if (name) {
      names.add(name);
    }
  });

  [...names].sort().forEach((name) => {
    console.log(name);
  });

  console.log("\n====================================");
  console.log("Nombre de noms différents :", names.size);
}

inspectTorso().catch(console.error);
