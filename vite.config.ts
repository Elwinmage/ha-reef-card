import { defineConfig } from "vite";

import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

import del from "rollup-plugin-delete";

// ============================================================================
// Configuration : Dossier de copie automatique
// ============================================================================
// Décommentez et configurez le chemin vers votre installation Home Assistant
//const COPY_TO_DIR = process.env.HA_CUSTOM_CARDS_DIR || null;
// Exemples:
const COPY_TO_DIR = "/config/www/community/ha-reef-card";

// Plugin Vite pour copier les fichiers
function copyPlugin() {
  return {
    name: "copy-to-ha",
    writeBundle() {
      if (!COPY_TO_DIR) {
        console.log(
          "ℹ️  Copie automatique désactivée (COPY_TO_DIR non configuré)",
        );
        return;
      }

      try {
        // Créer le dossier de destination s'il n'existe pas
        if (existsSync(COPY_TO_DIR)) {
          let copiedCount = 0;

          // ── 1. Copier les fichiers de dist/ ────────────────────────────────
          const distDir = resolve(__dirname, "dist");
          if (existsSync(distDir)) {
            const distFiles = readdirSync(distDir);

            distFiles.forEach((file) => {
              const src = resolve(distDir, file);
              const dst = resolve(COPY_TO_DIR, file);

              if (statSync(src).isFile()) {
                copyFileSync(src, dst);
                console.log(`✅ Copié (dist): ${file}`);
                copiedCount++;
              }
            });
          }

          // ── 2. Copier les fichiers de public/ (supplements, images, etc.) ───
          const publicDir = resolve(__dirname, "public");
          if (existsSync(publicDir)) {
            copyDirectoryRecursive(publicDir, COPY_TO_DIR);
            console.log(`✅ Copié (public): dossier complet`);
            copiedCount++;
          }

          if (copiedCount > 0) {
            console.log(`\n🎉 Copie terminée vers ${COPY_TO_DIR}\n`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la copie: ${error.message}`);
        console.error(
          `   Vérifiez que le dossier ${COPY_TO_DIR} est accessible`,
        );
      }
    },
  };
}

// Fonction pour copier récursivement un dossier
function copyDirectoryRecursive(src, dest) {
  // Créer le dossier de destination s'il n'existe pas
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      // Copier récursivement les sous-dossiers
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      // Copier le fichier
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig(({ mode }) => ({
  // Configuration du dossier public
  publicDir: "public",
  optimizeDeps: {
    include: ["lit/decorators.js"],
  },
  server: {
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    },
    hmr: {
      timeout: 2000,
    },
  },
  build: {
    // En mode development (watch), désactiver les source maps inline qui causent des problèmes
    sourcemap: mode === "production" ? true : false,
    // Toujours minifier pour éviter les caractères problématiques
    minify: mode === "production" ? "esbuild" : "esbuild",
    // Configuration pour éviter les problèmes de charset
    rollupOptions: {
      output: {
        entryFileNames: "ha-reef-card.js",
        assetFileNames: "[name].[ext]",
        // Forcer l'encoding UTF-8
        banner: "/* ha-reef-card - Home Assistant custom card */",
        // Éviter les caractères Unicode problématiques
        compact: true,
      },
    },
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "HaReefCard",
      fileName: () => "ha-reef-card.js",
      formats: ["es"],
    },
    test: {
      environment: "jsdom", // indispensable pour Lit
      globals: true,
      deps: {
        optimizer: {
          web: {
            include: ["lit", "lit/decorators.js", "@lit/reactive-element"],
          },
        },
      },
    },
    outDir: "dist",
    //emptyOutDir: true,
    emptyOutDir: false,
    // Augmenter la limite pour éviter les warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimisations pour le mode development
  esbuild: {
    charset: "utf8",
    legalComments: "none",
  },
  // Ajouter le plugin de copie
  plugins: [copyPlugin(), del({ targets: "dist/*", runOnce: true })],
}));
