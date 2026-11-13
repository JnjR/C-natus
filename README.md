# Recherche documentaire du CRIA

Pilote de recherche dans trois mémoires de l’Université d’État d’Haïti. L’interface est disponible en français, en kreyòl ayisyen et en anglais. La recherche utilise un index du texte des PDF et des synonymes trilingues. Le navigateur peut demander une précision quand plusieurs mémoires correspondent à la recherche.

## Déployer sur GitHub Pages

1. Décompressez l’archive et ajoutez son contenu à la racine de la branche `main` de votre dépôt. Incluez le fichier caché `.nojekyll`.
2. Dans le dépôt, ouvrez **Settings → Pages**.
3. Sous **Build and deployment**, choisissez **Deploy from a branch**, sélectionnez **main** et **/ (root)**, puis cliquez sur **Save**.
4. Une fois la publication terminée, ouvrez l’adresse affichée dans **Settings → Pages**.

[Documentation de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Essayer et modifier le code

Ouvrez `index.html` dans votre navigateur. Le site est statique et s’exécute sans installation ni clé d’API.

| Chemin | Contenu |
|---|---|
| `index.html` et `style.css` | Structure et présentation |
| `app.js` | Interface trilingue, échanges et liens vers les PDF |
| `search.js` | Classement des résultats et gestion des demandes ambiguës |
| `catalogue.js` | Titres, auteurs, résumés et synonymes |
| `corpus-index.js` | Index des mots par document et page |
| `coriolan.pdf`, `elie.pdf`, `nereus.pdf` | Les trois mémoires |

Pour essayer la relance, saisissez « Un mémoire sur Hobbes », puis « Celui qui compare Hobbes avec Darwin ». Le résultat attendu est le mémoire de Kensley Coriolan.

Pour ajouter un mémoire, mettez son PDF à la racine du dépôt, ajoutez ses métadonnées au catalogue et ajoutez son index par page. Utilisez le même identifiant dans le catalogue, l’index et le nom du fichier PDF.
