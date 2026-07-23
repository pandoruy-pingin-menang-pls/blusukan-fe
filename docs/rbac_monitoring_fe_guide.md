# Panduan Integrasi Frontend: RBAC & Smart Monitoring

Dokumen ini berisi panduan teknis bagi tim Frontend untuk mengintegrasikan fitur **Role-Based Access Control (RBAC)** dan **Monitoring & Impact** sesuai dengan rubrik penilaian.

> [!IMPORTANT]
> Sistem backend mewajibkan pengiriman header `Authorization: Bearer <token>` pada setiap *request*. Pastikan token yang digunakan sesuai dengan *role* (Wisatawan, Pedagang, atau Admin) untuk menghindari *error* `403 Forbidden`.

---

## 1. Pembagian Peran & Dashboard (Constraint RBAC)
Sistem memiliki 3 jenis peran utama. **Wajib dipastikan bahwa tampilan dashboard tidak boleh identik antar peran.** Setiap peran memiliki *endpoint* eksklusif.

### A. Dashboard Wisatawan (Turis)
Berfokus pada pencarian *event* wisata dan klaim diskon (gamifikasi).

*   **Endpoint 1: Mencari Event Aktif**
    *   `GET /api/events/search`
    *   **Deskripsi:** Menampilkan daftar *event* wisata yang bisa dihadiri.
*   **Endpoint 2: Promo & Diskon Tersedia**
    *   `GET /api/gamification/users/me/promos/available`
    *   **Deskripsi:** Menampilkan daftar promo dari pedagang sekitar yang bisa diklaim menggunakan sistem stempel (gamifikasi).

### B. Dashboard Pedagang (Merchant)
Berfokus pada manajemen toko, promosi jualan, dan rekomendasi AI (Smart Inventory).

*   **Endpoint 1: Profil Toko & Status**
    *   `GET /api/merchants/me`
*   **Endpoint 2: Rekomendasi Stok Harian (AI)**
    *   `GET /api/inventory/merchants/{merchant_id}/recommendations/today`
    *   **Deskripsi:** Mengambil hasil kalkulasi jarak lokasi pedagang ke *event* terdekat untuk rekomendasi jumlah stok jualan.
*   **Endpoint 3: Daftar Promo yang Dibuat**
    *   `GET /api/merchants/{merchant_id}/promos`

### C. Dashboard Administrator
Berfokus pada pengawasan ekosistem, performa aplikasi, dan dampak bisnis (*Smart Impact*).

*   **Endpoint 1: Smart Impact (Gemini AI)**
    *   `GET /api/admin/impact/metrics`
    *   **Respons:** Mengembalikan metrik pertumbuhan pengguna dan wawasan cerdas (`condition` & `recommendation`) hasil analisis Gemini AI secara *real-time*.
*   **Endpoint 2: Statistik Aktivitas Harian**
    *   `GET /api/admin/monitoring/stats`
    *   **Respons:** Menampilkan Total Pengguna Aktif Hari ini, Total Aktivitas, dan persentase aktivitas per peran (Pedagang vs Wisatawan).
*   **Endpoint 3: Jejak Aktivitas (Action Logs)**
    *   `GET /api/admin/monitoring/activities`
    *   **Respons:** Menampilkan *tabel log* aktivitas pengguna dari fungsi `ActivityLoggingMiddleware`.

---

## 2. Contoh Respons Data untuk UI Admin

Untuk mempermudah pembuatan UI Chart/Tabel bagi Administrator, berikut bentuk *response payload*-nya:

### A. Smart Impact Metrics (`GET /api/admin/impact/metrics`)
Gunakan data ini untuk membuat kartu-kartu ringkasan (*Summary Cards*) dan kotak peringatan (*Alert Box*) AI.
```json
{
  "condition": "Perlu Perhatian",
  "recommendation": "Tren peningkatan pendaftaran event sangat pesat. Segera tinjau pengajuan agar antrean tidak menumpuk.",
  "metrics": [
    {
      "label": "Total Wisatawan",
      "value": 1450
    },
    {
      "label": "Total Pedagang Aktif",
      "value": 312
    },
    {
      "label": "Event Menunggu Review",
      "value": 15
    },
    {
      "label": "Total Event",
      "value": 89
    }
  ]
}
```

### B. Monitoring Stats (`GET /api/admin/monitoring/stats`)
Gunakan data ini untuk merender **Pie Chart** / **Bar Chart** aktivitas harian.
```json
{
  "active_users_today": 125,
  "total_activities_today": 3480,
  "distribution_by_role": {
    "wisatawan": 2100,
    "pedagang": 1250,
    "admin": 130
  }
}
```

### C. Action Logs (`GET /api/admin/monitoring/activities`)
Gunakan data ini untuk merender **Tabel Dinamis**.
```json
{
  "activities": [
    {
      "id": "uuid-1234",
      "user_id": "uuid-abcd",
      "role": "pedagang",
      "action": "Upload Menu Catalog",
      "endpoint": "/api/merchants/me/catalog/ingest",
      "method": "POST",
      "created_at": "2026-07-23T10:05:00Z"
    }
  ]
}
```

> [!TIP]
> Saat demo di hadapan juri, Anda wajib melalukan *login* silang. Contoh: Login sebagai Wisatawan, lalu pancing agar layar Frontend mencoba *fetch* URL `GET /api/admin/impact/metrics`. Tampilkan notifikasi "*Akses Ditolak*" secara rapi di UI Frontend untuk membuktikan sistem RBAC berjalan ketat dari *Backend*.
