#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import zipfile
import xml.etree.ElementTree as ET
import shutil
import argparse
from PIL import Image

def process_ora_file(ora_path, output_dir="layers_export", do_crop=False):
    if not os.path.exists(ora_path):
        print(f"Erreur : Le fichier {ora_path} est introuvable.")
        return

    temp_dir = "temp_ora_extract"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    
    print(f"1. Décompression de l'archive {ora_path}...")
    with zipfile.ZipFile(ora_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)
        
    stack_xml_path = os.path.join(temp_dir, "stack.xml")
    if not os.path.exists(stack_xml_path):
        print("Erreur : Fichier stack.xml introuvable dans l'archive.")
        shutil.rmtree(temp_dir)
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"2. Traitement des calques (Crop automatique : {'Activé'})..." if do_crop else "2. Traitement des calques...")
    tree = ET.parse(stack_xml_path)
    root = tree.getroot()

    count = 0
    for layer in root.iter('layer'):
        src = layer.get('src')   # ex: "data/000.png"
        name = layer.get('name') # ex: "Sensors"
        
        if src and name:
            safe_name = "".join([c if c.isalnum() or c in (' ', '_', '-') else '_' for c in name])
            src_file = os.path.join(temp_dir, src)
            dest_file = os.path.join(output_dir, f"{safe_name}.png")
            
            if os.path.exists(src_file):
                with Image.open(src_file) as img:
                    # Si l'option crop est activée et que l'image n'est pas entièrement vide
                    if do_crop:
                        # getbbox() renvoie les limites (gauche, haut, droite, bas) des pixels non transparents
                        bbox = img.getbbox()
                        if bbox:
                            img = img.crop(bbox)
                        else:
                            # Calque entièrement transparent : on crée un petit carré vide 1x1 pour éviter l'erreur
                            img = img.crop((0, 0, 1, 1))

                    img.save(dest_file, "PNG", compress_level=9, optimize=True)
                
                print(f"  -> Exporté : {safe_name}.png")
                count += 1
            else:
                print(f"  -> Attention : Fichier introuvable {src}")

    shutil.rmtree(temp_dir)
    print(f"\nTerminé ! {count} calques exportés dans : ./{output_dir}/")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extrait, renomme, compresse et optionnellement rogne les calques d'un .ora")
    parser.add_argument("ora_file", help="Chemin vers le fichier .ora à traiter")
    parser.add_argument("-o", "--output", default="layers_export", help="Dossier de destination")
    parser.add_argument("-c", "--crop", action="store_true", help="Rogner automatiquement les calques pour supprimer les zones transparentes inutiles")
    
    args = parser.parse_args()
    process_ora_file(args.ora_file, args.output, args.crop)