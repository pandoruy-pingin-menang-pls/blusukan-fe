# Panduan Integrasi Frontend: Smart Impact & Activity Monitoring (Constraint 1)

Panduan ini menjelaskan arsitektur backend, rute API yang tersedia, serta langkah-langkah praktis untuk mengintegrasikan dan menyempurnakan fitur-fitur pada aplikasi frontend (Expo React Native).

---

## 1. Peta API Backend (FastAPI)

Berikut adalah daftar endpoint di backend (`blusukan-be`) yang dirancang khusus untuk dashboard Admin (Constraint 1):

| Endpoint | Method | Deskripsi | Parameter Query | Autentikasi |
|---|---|---|---|---|
| `/api/admin/impact/metrics` | `GET` | Metrik agregat (Total Wisatawan, Pedagang Aktif, Event Menunggu Review, Total Event), kondisi sistem, dan rekomendasi banner. | - | Bearer Token (Admin) |
| `/api/admin/impact/action-logs` | `GET` | Daftar data event (sebagai action logs) dengan dukungan filter. | `period` (`all`, `today`, `week`, `month`), `status` (`pending_review`, `approved`, `rejected`) | Bearer Token (Admin) |
| `/api/admin/monitoring/stats` | `GET` | Statistik aktivitas hari ini (Unique active users, total aktivitas, & distribusi role). | - | Bearer Token (Admin) |
| `/api/admin/monitoring/activities` | `GET` | Log aktivitas real-time (POST/PUT/DELETE/PATCH) oleh semua pengguna. | `limit` (default: 50) | Bearer Token (Admin) |
| `/api/admin/events/{event_id}/review` | `PATCH` | Menolak atau menyetujui pendaftaran event (Human-in-the-Loop). | `event_id` (Path) | Bearer Token (Admin) |

> [!NOTE]
> Semua endpoint di atas memerlukan header `Authorization: Bearer <token>` dan pengguna harus memiliki role `admin`.

---

## 2. Struktur Kode Frontend Saat Ini

### A. Role Guard & Navigation
* **Auth Guard & Routing**: Berada di [_layout.tsx](file:///d:/FASILKOM%20UI/PROJECT/blusukan/blusukan-fe/src/app/_layout.tsx). File ini memeriksa peran pengguna setelah login. Jika peran pengguna adalah `admin` tetapi mencoba membuka halaman non-admin (atau sebaliknya), aplikasi otomatis mengarahkan ke halaman yang sesuai.
* **Bottom Navigation**: Berada di [BottomNav.tsx](file:///d:/FASILKOM%20UI/PROJECT/blusukan/blusukan-fe/src/components/layout/BottomNav.tsx). Layar `Impact` dan `Monitoring` hanya ditampilkan jika pengguna memiliki role `admin`.

### B. Halaman Dashboard Admin
* **Impact Dashboard**: Berada di [impact-dashboard.tsx](file:///d:/FASILKOM%20UI/PROJECT/blusukan/blusukan-fe/src/app/\(admin\)/impact-dashboard.tsx).
* **Activity Monitoring**: Berada di [monitoring.tsx](file:///d:/FASILKOM%20UI/PROJECT/blusukan/blusukan-fe/src/app/\(admin\)/monitoring.tsx).

---

## 3. Langkah Penyempurnaan Frontend (Hands-on Guide)

### Langkah 1: Menghubungkan Aksi "Approve/Reject" pada Log Event

Saat ini tombol **Aksi** pada tabel Action Logs di `impact-dashboard.tsx` masih statis. Kita perlu menambahkan aksi interaktif (misalnya memunculkan `Alert` pilihan untuk **Setujui** atau **Tolak** event).

#### 1. Implementasikan Fungsi Review API di [impact-dashboard.tsx](file:///d:/FASILKOM%20UI/PROJECT/blusukan/blusukan-fe/src/app/\(admin\)/impact-dashboard.tsx)

Tambahkan fungsi berikut di dalam komponen `ImpactDashboard`:

```tsx
import { Alert } from "react-native";

// ... di dalam komponen ImpactDashboard:

const handleReviewEvent = async (eventId: string, action: "approve" | "reject") => {
  try {
    setLoading(true);
    const token = await getToken("access_token");
    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

    await axios.patch(
      `${baseUrl}/api/admin/events/${eventId}/review`,
      { action },
      { headers }
    );

    Alert.alert("Sukses", `Event berhasil di-${action === "approve" ? "setujui" : "tolak"}.`);
    // Segera refresh data setelah perubahan status
    fetchData();
  } catch (err) {
    console.error("Gagal memproses review event", err);
    Alert.alert("Error", "Gagal memproses aksi review.");
    setLoading(false);
  }
};

const showActionDialog = (event: ActionLog) => {
  if (event.status !== "pending_review") {
    Alert.alert("Informasi", "Event ini sudah direview.");
    return;
  }

  Alert.alert(
    "Review Event",
    `Pilih tindakan untuk event: "${event.name}"`,
    [
      {
        text: "Setujui (Approve)",
        onPress: () => handleReviewEvent(event.id, "approve"),
        style: "default",
      },
      {
        text: "Tolak (Reject)",
        onPress: () => handleReviewEvent(event.id, "reject"),
        style: "destructive",
      },
      {
        text: "Batal",
        style: "cancel",
      },
    ]
  );
};
```

#### 2. Hubungkan Fungsi ke Render Item di `impact-dashboard.tsx`

Cari baris render tombol "Aksi" (di sekitar line 137) dan ubah komponen `Pressable` agar memanggil `showActionDialog`:

```diff
- <Pressable className="bg-navy-800 px-3 py-1.5 rounded-lg">
-   <Text className="text-white text-xs font-sans-semibold">Aksi</Text>
- </Pressable>
+ <Pressable 
+   onPress={() => showActionDialog(log)} 
+   className={`px-3 py-1.5 rounded-lg ${log.status === 'pending_review' ? 'bg-navy-800' : 'bg-gray-300'}`}
+   disabled={log.status !== 'pending_review'}
+ >
+   <Text className="text-white text-xs font-sans-semibold">
+     {log.status === 'pending_review' ? 'Review' : 'Selesai'}
+   </Text>
+ </Pressable>
```

---

## 4. Panduan Pengujian Manual (QA Checklist)

Untuk memastikan integrasi frontend dan backend berjalan sempurna, lakukan langkah verifikasi berikut:

1. **Uji Coba Hak Akses (RBAC Client-Side & Server-Side)**:
   * Login sebagai akun dengan role `Wisatawan` atau `Pedagang`.
   * Coba ketik rute browser/URL manual atau arahkan ke `/admin`. Pastikan layar ter-redirect kembali ke halaman asal (terbukti di client-side guard `_layout.tsx`).
   * Coba panggil endpoint `/api/admin/impact/metrics` via Postman menggunakan token non-admin, pastikan server mengembalikan `403 Forbidden`.

2. **Uji Coba Activity Logging (Constraint Middleware)**:
   * Menggunakan akun non-admin, lakukan aksi mutasi data (misalnya: membuat rute/itinerary, membeli barang di kasir/POS, atau menambahkan item katalog).
   * Login kembali sebagai `Admin` dan buka menu **Monitoring**.
   * Pastikan aktivitas mutasi yang baru saja dilakukan tercatat pada tabel **Recent Activities** beserta detail endpoint, metode HTTP, dan role pelaku aksi.

3. **Uji Coba Smart Impact Dashboard**:
   * Masuk sebagai `Admin`, buka tab **Impact**.
   * Ubah filter dropdown **Period** dan **Status** dan pastikan data di daftar Action Logs berubah secara dinamis (tidak statis).
   * Klik tombol **Review** pada salah satu event berstatus *pending_review*, pilih **Approve**.
   * Pastikan banner status di atas diperbarui, total metrik "Event Menunggu Review" berkurang, dan status baris data tersebut berubah menjadi `approved`.
