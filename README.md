# Blusukan

### Development Commands & UI Kit

To start the application and clear the Metro bundler cache, run the following command:

```bash
npx expo start -c

```

#### Navigation: Normal Flow vs. UI Kit

If you are on **macOS/Linux**, you can use the commands below in a separate terminal to quickly swap the initial route. This allows you to preview the UI Kit without needing to navigate manually.

**To switch to the UI Kit:**

```bash
sed -i '' 's|/(auth)/login|/_dev-ui-kit|' src/app/index.tsx

```

**To revert to the Normal Flow (Auth/Login):**

```bash
sed -i '' 's|/_dev-ui-kit|/(auth)/login|' src/app/index.tsx

```

> **⚠️ Important Notes:**
> * **Reload Required:** After running either `sed` command, you must press **`r`** in your active Expo terminal to reload the app and see the changes.
> * **Windows Users:** The `sed` command is not natively supported. Please manually update the route string inside `src/app/index.tsx` when switching between flows.
