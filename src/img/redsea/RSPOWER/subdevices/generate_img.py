#!/usr/bin/env python3
"""
Script Python pour redimensionner des images à une largeur de 150px.
Nécessite la bibliothèque Pillow (pip install Pillow).

Usage: python resize_images.py image1.jpg image2.png
"""

import sys
import os
from PIL import Image

def resize_images(image_paths, target_width=150):
    if not image_paths:
        print("Usage: python resize_images.py <image1> [image2 ...]")
        sys.exit(1)

    for path in image_paths:
        if not os.path.isfile(path):
            print(f"Avertissement : Le fichier '{path}' n'existe pas.")
            continue

        try:
            with Image.open(path) as img:
                # Calcul de la nouvelle hauteur en conservant les proportions
                w_percent = (target_width / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))

                # Redimensionnement avec l'algorithme Resampling.LANCZOS pour la qualité
                resized_img = img.resize((target_width, h_size), Image.Resampling.LANCZOS)

                # Nom du fichier de sortie dans le répertoire d'exécution courant
                filename = os.path.basename(path)
                output_path = os.path.join(os.getcwd(), f"{filename}")

                resized_img.save(output_path)
                print(f"Image redimensionnée avec succès : {output_path}")

        except Exception as e:
            print(f"Erreur lors du traitement de '{path}' : {e}")

if __name__ == "__main__":
    resize_images(sys.argv[1:])
    
