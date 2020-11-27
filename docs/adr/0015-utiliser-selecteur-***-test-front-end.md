# 1. Utiliser le sélecteur **** pour les test front-end

Date : <TODO>

## État

Proposé

## Contexte

Sur les tests front-end, nous avons besoin de vérifier que certaines balises sont présentes.
Suite à un échange un PR, il semble que la solution [ne soit pas partagée](https://github.com/1024pix/pix/pull/2183#issuecomment-734674614)

Nous avons aussi besoin que le test passe si:
- si la balise est déplacée
- utilisateur choisi une autre langue
- le texte affiché à l'écran par la balise change 

3 solutions s'offrent pour la construction: 
- rechercher le texte contenu dans la balise
- utiliser un sélecteur sur l'attribut `aria-label`
- utiliser un sélecteur sur attribut `data-test`

Source:
- 
- https://stackoverflow.com/questions/58794288/when-developing-e2e-tests-why-is-data-attributes-preferred-for-element-select

## Décision

## Conséquences

Utiliser le sélecteur *****
Utiliser le plug-in https://ember-test-selectors.com/ ?


