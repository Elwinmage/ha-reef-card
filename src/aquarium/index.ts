/**
 * Aquarium view: register its card, its Lovelace editor and its scene
 * editor.
 */
import { ReefAquariumCard } from "./aquarium_card";
import { ReefAquariumCardEditor } from "./editor/card_editor";
import { ReefAquariumSceneEditor } from "./editor/scene_editor";
import { ReefCoralPreview } from "./editor/coral_preview";
import { ReefColourPicker } from "./editor/colour_picker";

if (!customElements.get("reef-aquarium-card"))
  customElements.define("reef-aquarium-card", ReefAquariumCard);
if (!customElements.get("reef-aquarium-card-editor"))
  customElements.define("reef-aquarium-card-editor", ReefAquariumCardEditor);
if (!customElements.get("reef-aquarium-scene-editor"))
  customElements.define("reef-aquarium-scene-editor", ReefAquariumSceneEditor);
if (!customElements.get("reef-coral-preview"))
  customElements.define("reef-coral-preview", ReefCoralPreview);
if (!customElements.get("reef-colour-picker"))
  customElements.define("reef-colour-picker", ReefColourPicker);

export {
  ReefAquariumCard,
  ReefAquariumCardEditor,
  ReefAquariumSceneEditor,
  ReefCoralPreview,
  ReefColourPicker,
};
