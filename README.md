`npx expo start -c`

**Phase 1: Repository, Environment, & Architecture Setup**
- Struktur folder scalable untuk Expo Router (app/, components/, features/,
  services/api, store/, hooks/, constants/ termasuk design tokens, utils/)
- Setup ESLint/Prettier, TypeScript, absolute import alias, .env (EXPO_PUBLIC_*)
- Branching strategy dari development s.d. demo day release

**Phase 2: Design System & Shared Components (UI Kit)**
- Design tokens sesuai arahan desain di atas: warna, tipografi, spacing, radius,
  elevation — didefinisikan sebagai NativeWind theme config, bukan hardcoded
- Daftar base component yang harus dibuat duluan (Button, Input, Modal, Card,
  Badge/Stamp, BottomSheet, Toast) lengkap dengan varian per-mode (Dolan/Bakul)
- Layout utama: TopBar, Mode-Switcher (Dolan↔Bakul), TabBar, Wrapper/Screen container

**Phase 3: Routing & Pages Implementation (Staged)**
- Pemetaan routing: Public (Login/Onboarding) vs Protected (Dolan Home, Peta &
  Rute, Bakul Dashboard, Stamp Wallet, dst — sesuaikan dengan 2.6 Low-Fidelity
  Prototype di proposal)
- Pecah ke Stage prioritas (3.1 Auth & Onboarding, 3.2 Dolan Mode core, 3.3 Bakul
  Mode core, 3.4 Gamifikasi & Redemption, dst.)
- Rincian komponen spesifik per halaman

**Phase 4: State Management & API Integration (Core Focus)**
- Skema state: mana yang global (Zustand — mis. active mode, user session, stamp
  count) vs local (form state, UI toggle)
- Mapping endpoint FastAPI ke tiap screen/komponen (itinerary generation, stok
  prediktif, ingest multimodal, "sold" logging, redemption)
- Standar Loading (skeleton), Error handling, Success feedback (toast) yang
  konsisten di semua flow

**Phase 5: Security, Testing, & Optimization**
- Route guard berbasis session/token (Expo SecureStore)
- Rencana unit test dasar untuk utils & reusable component
- Optimasi: lazy loading untuk screen berat (peta), image optimization untuk
  hasil upload foto menu/produk merchant

# Notes:
# saat mau CEK UI kit:
sed -i '' 's|/(auth)/login|/_dev-ui-kit|' src/app/index.tsx

# saat mau BALIK ke flow normal:
sed -i '' 's|/_dev-ui-kit|/(auth)/login|' src/app/index.tsx
Reload (r di terminal) setiap habis switch. Simpel, nggak perlu nav manual tiap kali.