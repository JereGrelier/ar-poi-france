# Agent / contributor notes (mobile)

This is an **Expo React Native** app using **React Navigation** (native stack), not Expo Router.

- Screens: `src/screens/`
- Shared pose: `src/pose/PoseContext.tsx`
- API client: `src/api/pois.ts` → proxy `EXPO_PUBLIC_API_URL`

Prefer SDK-compatible installs:

```bash
npx expo install <package>
npx tsc --noEmit
npm run check
```
