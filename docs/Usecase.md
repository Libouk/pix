# Use-case

## Définition

Un use-case:
 - est une fonction
 - [utilise le pattern RORO](https://medium.freecodecamp.org/elegant-patterns-in-modern-javascript-roro-be01e7669cbd)
 - require seulement des éléments venant du domaine
 - récupère ses dépendances vers l'extérieur en tant que paramètres donnés à la fonction

```javascript
// BAD
const myRepository = require('../../../infrastructure/repositories/myRepository');

// GOOD
const myService = require(../../../domain/services/myService);

module.exports = function myUseCase({ param1, param2, param3, repo1, repo2 }) {
  ...
};
```

## Controllers

Un controller ne peut __pas__ appeler __2__ use-case séquentiellement.

