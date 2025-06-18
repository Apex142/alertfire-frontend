// Utilise ts-morph pour parser le projet et repérer les imports Firebase
import path from "path";
import { Project } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: false,
});

const suspectFiles = [];

project.getSourceFiles().forEach((sf) => {
  const hasFirebaseImport = sf.getImportDeclarations().some((imp) => {
    const spec = imp.getModuleSpecifierValue();
    return /^(firebase\/|@capacitor-firebase\/authentication)/.test(spec);
  });

  if (!hasFirebaseImport) return;

  // Fichiers clairement côté client :
  const isClientMarked =
    sf.getText().startsWith('"use client"') ||
    sf.getText().startsWith("'use client'");

  // Pages / layouts App Router SANS "use client" → exécutées côté serveur
  const filename = sf.getFilePath();

  if (!isClientMarked && filename.includes(path.join("app", path.sep))) {
    suspectFiles.push(filename);
  }
});

if (!suspectFiles.length) {
  console.log("✅ Aucun import Firebase problématique trouvé.");
} else {
  console.log("🚨 Imports Firebase trouvés dans du code SSR :\n");
  suspectFiles.forEach((f) =>
    console.log(" - " + path.relative(process.cwd(), f))
  );
}
