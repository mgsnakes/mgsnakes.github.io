# Forge des Noms · Tyrie

Générateur de noms fidèle au lore de **Guild Wars 2**, habillé dans la
**direction artistique du site officiel** guildwars2.com : header sticky sombre,
hero plein écran, bandes de section alternées, footer multi-colonnes, palette
rouge/or sur charbon.

> Réplique de la *direction artistique*, pas un clone : aucun asset propriétaire
> d'ArenaNet n'est utilisé. Le logotype, les paysages et les visuels sont
> recréés en SVG (libres de droits). Police fantasy approchante (Cinzel).

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production -> dist/
npm run preview
```

## Habillage (façon site officiel)

- **Header sticky** : logotype, navigation en capitales avec **menus déroulants**,
  bouton d'action rouge, bascule de thème, menu burger responsive.
- **Hero plein écran** : titre massif, accroche, double bouton, fond paysage SVG.
- **Bandes de section** alternées (image/texte) présentant chaque outil.
- **Footer** : logotype, réseaux, colonnes de liens, mentions légales.
- **Deux styles de fond** au choix (bouton dans le hero) : **paysages SVG** ou
  **dégradés** seuls. **Thème clair / sombre** (sombre par défaut).

## Outils (pages)

- **Forge** — générateur principal : 5 races (~200 prénoms chacune), filtres
  simples et avancés (initiale, longueur, anti-répétition), liste/grille,
  raccourcis clavier, copie nom seul ou nom + lore.
- **Warbands** — warband charr complète (4-8 membres, hiérarchie).
- **Guildes** — nom de guilde + tag.
- **Peuples** — encyclopédie : fiche par race (lore, convention, exemples canon).
- **Coffre** — favoris persistants, export .txt.

## Architecture

```
src/
  data/races.js, data/lore.js        banques + conventions + fiches
  lib/generator.js                   noms, warbands, guildes, filtres
  context/  ThemeContext  ChestContext  VisualContext
  hooks/    useHashRoute (navigation par hash)
  components/  SiteHeader, Hero, FeatureBand, SiteFooter, Scenery,
               Logotype, NameCard, RaceSeals, DragonGlyph…
  pages/    Forge, Warbands, Guildes, Peuples, Coffre
  styles/   theme.css (palette), global.css
```

---

Conventions d'après wiki.guildwars2.com. Noms générés fictifs ; ils peuvent
coïncider avec des PNJ existants. Projet de fan non affilié à ArenaNet / NCSOFT.
