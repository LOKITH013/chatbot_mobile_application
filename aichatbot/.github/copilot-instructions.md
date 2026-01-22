Project: aichatbot — Copilot instructions

Purpose

- Help AI coding agents make safe, correct edits in this React Native TypeScript app.

Big picture

- Single React Native app rooted at `src/`. Entry: `App.tsx` -> `src/navigation/RootNavigator.tsx`.
- UI is component-driven under `src/components/` (per-component folder with same-name file, e.g. `ChatContainer/ChatContainer.tsx`).
- Message flow: `ChatContainer` -> `MessageList` renders `Message` objects (see `src/types/index.ts`), `InputBar` sends messages to handlers.
- API calls live in `src/api/` (e.g. `timesheetApi.ts`). Persistent chat helpers in `src/utils/chatstorage.ts`.

Key files to inspect before making changes

- Navigation: `src/navigation/RootNavigator.tsx` (routing & screen registration).
- Main UI: `src/components/ChatContainer/ChatContainer.tsx`, `src/components/MessageList/MessageList.tsx`.
- Types: `src/types/index.ts` — use these shapes for messages and payloads (TABLE payloads are rendered specially).
- Styles: per-component style files default-export a `styles` object (examples: `src/components/ChatContainer/ChatContainerStyles.ts`, `src/components/MessageList/MessageListStyles.ts`).
- Config: `tsconfig.json` (baseUrl is `src` for absolute imports).

Project-specific conventions

- Component folders: {ComponentName}/{ComponentName}.tsx + optional {ComponentName}Styles.ts or .tsx exporting default styles.
- Import patterns:
  - Relative component import: `import ChatContainer from '../ChatContainer/ChatContainer';`
  - Absolute import allowed (because of `baseUrl: "src"`): `import Root from 'components/ChatContainer/ChatContainer';`
- Styles always default-export a `StyleSheet` object. When creating a new style file, export default the result of `StyleSheet.create(...)`.
- Message payloads: check for `item.payload?.type === 'TABLE'` in `MessageList` and follow the existing `renderTable(columns, rows)` pattern.

Build / test / debug

- Start Metro: `npm start` or `yarn start` (run from repository root).
- Android: `npm run android` or `yarn android`.
- iOS: `npm run ios` or `yarn ios` (run `bundle exec pod install` in `ios/` on macOS first).
- Tests: Jest config at `jest.config.js`. Run `npm test` or `yarn test`.

Common issues & fixes

- "Cannot find module './components/ChatContainerStyles'": verify import path is relative to the importing file. Prefer using `src` absolute imports (e.g. `components/...`) or correct relative path (`../ChatContainer/ChatContainerStyles`). Check `tsconfig.json` baseUrl.
- Adding a new component: create folder `src/components/MyComp/`, add `MyComp.tsx` and `MyCompStyles.ts` (default export). Update navigation/screens under `src/components/screen` if the screen should be routable.

Small examples

- Styles file example:
  ```ts
  import { StyleSheet } from 'react-native';
  export default StyleSheet.create({ container: { flex: 1 } });
  ```
- Table messages are rendered in `MessageList` — follow existing `renderTable(columns, rows)` implementation.

When to ask a human

- If a change affects native iOS/Android config (`android/`, `ios/`), or requires new native modules, stop and request guidance.
- If you need API keys or third-party service credentials, do not add them to the repo — ask the maintainer.

If anything here is unclear or you want examples expanded, ask and I'll iterate.
