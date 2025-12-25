# How to Add your language to this card

1) Log into github
2) Go to http://github.com/Elwinmage/ha-reef-card
3) Click on Fork (At the upper right between "Watch" and "Star") then "Create a new fork"  <kbd><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/i18n/fork.png" /></kbd>
4) Click on Create fork

   <kbd><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/i18n/new_fork.png" /></kbd>
   
5) Go to src/translation/dictionnary.js
6) Edit the file with the pencil at upper right 

<kbd><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/i18n/edit_const.png" /></kbd>

7) Create a new block with your translation at the end of the file between '},' '}' (penultimate line) with your language using your [international code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes). Don't forget the coma at the end of the old block;

   Example for french translation:
```
export const dict={
    en:{
	canNotFindTranslation: "Can not find translation string: ",
	disabledInHa: "Device disabled in HomeAssistant!",
	head: "Head",
    },
}
```
became:
```
export const dict={
    en:{
	canNotFindTranslation: "Can not find translation string: ",
	disabledInHa: "Device disabled in HomeAssistant!",
	head: "Head",
    },
    fr:{
	canNotFindTranslation: "Traduction introuvable pour: ",
	disabledInHa: "Périphérique désactivé dans HomeAssistant!",
	head: "Tête",
   },
}
```
   8) Once done click on "Commit Change" 
   
   <kbd><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/i18n/commit_changes.png" /></kbd>
   
   9) Update the commit message and indicate the new language
   10) Select Create a new branche and then "Propose changes" 
   
   <kbd><img src="https://github.com/Elwinmage/ha-reefbeat-component/blob/main/doc/img/i18n/propose_changes.png" /></kbd>
   
   11) Then "Create a pull Request" (twice)

