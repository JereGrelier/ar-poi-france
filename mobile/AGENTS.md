# Agent / contributor notes (mobile)

This is an **Expo React Native** app using **React Navigation** (native stack), not Expo Router.

- Screens: `src/screens/`
- Shared pose: `src/pose/PoseContext.tsx`
- Shared filters/POIs: `src/filters/FiltersContext.tsx`
- API client: `src/api/pois.ts` → proxy `EXPO_PUBLIC_API_URL`
- Types/geo: `@ar-poi/shared` (see `packages/shared`)
- Demo GPS fallback only when `EXPO_PUBLIC_DEMO_FALLBACK=1`

Prefer SDK-compatible installs:

```bash
npx expo install <package>
npm run typecheck
npm run check
```
