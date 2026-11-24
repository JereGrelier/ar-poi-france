# AR POI France

Application mobile **location-based AR** qui affiche les points d’intérêt touristiques autour de l’utilisateur, alimentée par [DATAtourisme](https://www.datatourisme.fr/) (données touristiques France).

| Couche  | Stack                                                |
| ------- | ---------------------------------------------------- |
| Mobile  | Expo (React Native) — caméra + GPS + heading + pitch |
| API     | Proxy Express → DATAtourisme `geo_distance`          |
| Shared  | `@ar-poi/shared` — types + géo                       |
| Données | Licence Ouverte 2.0 (voir [NOTICE](NOTICE))          |

## Prérequis

- Node.js 20+
- Compte [DATAtourisme](https://www.datatourisme.fr/utiliser-les-donnees) (optionnel en `MOCK_MODE`)
- Device réel recommandé (GPS + caméra)

## Démarrage rapide

```bash
git clone https://github.com/JereGrelier/ar-poi-france.git
cd ar-poi-france

cp .env.example server/.env
# Éditer server/.env : DATATOURISME_API_KEY=… et MOCK_MODE=0 pour le live

npm install

# Terminal 1 — proxy (port 8787)
npm run server

# Terminal 2 — Expo
npm run mobile
```

Sur un téléphone physique, pointez l’app vers votre machine :

```bash
EXPO_PUBLIC_API_URL=http://<IP-LAN>:8787 npm --prefix mobile start
```

Mode démo GPS (fallback Paris + bannière visible) :

```bash
EXPO_PUBLIC_DEMO_FALLBACK=1 npm --prefix mobile start
```

## Scripts

| Commande             | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run server`     | Proxy DATAtourisme                         |
| `npm run server:dev` | Proxy avec reload                          |
| `npm run mobile`     | Expo                                       |
| `npm run check`      | Self-checks géo (shared + server + mobile) |
| `npm test`           | Tests unitaires (shared + server)          |
| `npm run typecheck`  | `tsc --noEmit`                             |
| `npm run lint`       | Prettier check                             |
| `npm run format`     | Prettier write                             |

## Architecture

```
GPS + heading + pitch ──► App Expo ──► Proxy /api/pois ──► DATAtourisme
                              │                │
                              └── overlay RA ◄─┘  (azimut / distance / collision)
```

- **Liste** — POI à proximité, filtres rayon / type (état partagé avec la RA)
- **Vue RA** — labels sur le flux caméra (cap + pitch + FOV)
- **Détail** — fiche POI (toujours rafraîchie via `/api/pois/:id`)

La clé API reste côté serveur (`DATATOURISME_API_KEY`) — jamais dans le binaire mobile.

## Sécurité

- Ne committez jamais `server/.env`
- Quotas DATAtourisme (~1000 req/h) : cache ~60 s + rate limit proxy
- CORS configurable via `CORS_ORIGINS`
- Voir [SECURITY.md](SECURITY.md)

## Builds EAS (notes)

Production builds are optional and not required for local development.

1. Install EAS CLI: `npm i -g eas-cli`
2. From `mobile/`: `eas login` then `eas build:configure`
3. Set `EXPO_PUBLIC_API_URL` to your deployed proxy URL in EAS secrets / env
4. Keep `DATATOURISME_API_KEY` only on the server; never embed it in the app
5. Prefer a reverse-proxy with TLS in front of the Express process

## Licence

- **Code** : [MIT](LICENSE)
- **Données DATAtourisme** : Licence Ouverte 2.0 — attribution requise ([NOTICE](NOTICE))
