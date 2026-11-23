# AR POI France

Application mobile **location-based AR** qui affiche les points d’intérêt touristiques autour de l’utilisateur, alimentée par [DATAtourisme](https://www.datatourisme.fr/) (données touristiques France).

| Couche | Stack |
|--------|--------|
| Mobile | Expo (React Native) — caméra + GPS + heading |
| API | Proxy Express → DATAtourisme `geo_distance` |
| Données | Licence Ouverte 2.0 (voir [NOTICE](NOTICE)) |

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

npm --prefix server install
npm --prefix mobile install

# Terminal 1 — proxy (port 8787)
npm run server

# Terminal 2 — Expo
npm run mobile
```

Sur un téléphone physique, pointez l’app vers votre machine :

```bash
EXPO_PUBLIC_API_URL=http://<IP-LAN>:8787 npm --prefix mobile start
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run server` | Proxy DATAtourisme |
| `npm run server:dev` | Proxy avec reload |
| `npm run mobile` | Expo |
| `npm run check` | Self-checks géo (server + mobile) |

## Architecture

```
GPS + heading ──► App Expo ──► Proxy /api/pois ──► DATAtourisme
                      │                │
                      └── overlay RA ◄─┘  (azimut / distance)
```

- **Liste** — POI à proximité, filtres rayon / type
- **Vue RA** — labels sur le flux caméra selon le cap
- **Détail** — fiche POI

La clé API reste côté serveur (`DATATOURISME_API_KEY`) — jamais dans le binaire mobile.

## Sécurité

- Ne committez jamais `server/.env`
- Quotas DATAtourisme (~1000 req/h) : le proxy cache les réponses ~60 s
- Voir [SECURITY.md](SECURITY.md)

## Licence

- **Code** : [MIT](LICENSE)
- **Données DATAtourisme** : Licence Ouverte 2.0 — attribution requise ([NOTICE](NOTICE))
