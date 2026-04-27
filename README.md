# QALite: Manajemen QA Simpel & Pelacakan Bug Lintas Platform

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react) ![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter) ![Firebase](https://img.shields.io/badge/Firebase-BaaS-FFCA28?logo=firebase) ![RevenueCat](https://img.shields.io/badge/RevenueCat-Monetisasi-F50057)

## Ringkasan Eksekutif

QALite adalah aplikasi Quality Assurance (QA) dan pelacakan bug yang didesain untuk pengujian manual tanpa kompleksitas sistem otomasi. Memanfaatkan React untuk Web, Flutter untuk Mobile, Firebase sebagai backend, dan RevenueCat untuk monetisasi, platform ini menjamin kolaborasi lintas platform yang aman, tersinkronisasi secara real-time, dan ramah anggaran.

Sistem mengadopsi model freemium dengan tier **Starter** (Gratis) dan **Pro** ($12/Bulan).

---

## Daftar Isi

1. [Arsitektur Teknologi](#2-arsitektur-teknologi)
2. [Kendala Operasional & Risiko Sistem](#3-kendala-operasional--risiko-sistem)
3. [Alur Kerja dan Fitur Utama](#4-alur-kerja-dan-fitur-utama)
4. [Struktur Basis Data](#5-struktur-basis-data)
5. [Model Langganan & Analisis Profitabilitas](#6-model-langganan--analisis-profitabilitas)
6. [Pelaporan & Analitik](#7-pelaporan--analitik)
7. [Roadmap](#8-roadmap)
8. [Panduan Instalasi & Deployment](#9-panduan-instalasi--deployment)

---

## 1. Arsitektur Teknologi

Pemilihan teknologi difokuskan pada kecepatan pengembangan, skalabilitas infrastruktur, dan efisiensi biaya.

### 1.1. Frontend Web (React)

Aplikasi web dirancang untuk pekerjaan administratif seperti penulisan skenario pengujian, analisis grafik, dan manajemen tim.

- **Framework:** React 18+ dengan Vite
- **State Management:** Zustand
- **Styling:** TailwindCSS + Radix UI / Shadcn UI
- **Routing:** React Router DOM

### 1.2. Frontend Mobile (Flutter)

Aplikasi mobile ditujukan untuk tester di lapangan.

- **Framework:** Flutter 3.x (iOS & Android dari satu codebase)
- **State Management:** Riverpod
- **Routing:** GoRouter
- **Desain:** Material 3 (Material You)

### 1.3. Backend dan Infrastruktur (Firebase)

- **Firebase Authentication:** Email/Password dan Social Login (Google, GitHub)
- **Cloud Firestore:** Basis data NoSQL berskala global dengan sinkronisasi real-time
- **Cloud Storage:** Menyimpan lampiran screenshot dan video rekaman bug
- **Cloud Functions:** Logika server-side (agregat statistik, manajemen undangan)

### 1.4. Manajemen Monetisasi (RevenueCat)

Lapisan abstraksi di atas Google Play Billing, Apple App Store Connect, dan Stripe.

- **Integrasi SDK:** Flutter dan React
- **Fungsi Utama:** Melacak status entitlement langganan secara terpusat

---

## 2. Kendala Operasional & Risiko Sistem

- **Vendor Lock-in (Firebase):** Aplikasi sangat terikat pada ekosistem Firebase. Migrasi ke AWS atau Supabase di masa depan akan membutuhkan perombakan besar pada lapisan akses data di klien Web maupun Mobile.
- **NoSQL Read Explosion:** Penagihan Firestore didasarkan pada jumlah Document Reads, bukan hanya penyimpanan. Kueri yang tidak dioptimalkan — misalnya membaca jutaan dokumen test case mentah alih-alih satu dokumen agregat — dapat menyebabkan lonjakan biaya eksponensial saat aplikasi diskalakan.

---

## 3. Alur Kerja dan Fitur Utama

### 3.1. Manajemen Skenario dan Kasus Uji

Hierarki: **Project → Test Scenario → Test Case**

- **Pembuatan Cepat (Web):** Antarmuka spreadsheet-like. Menekan `Enter` otomatis membuat baris Test Case baru.
- **Eksekusi Terfokus:** Layar eksekusi dengan 4 tombol: `Pass`, `Fail`, `Blocked`, `Skip`.
- **Otomasi Bug Report:** Jika Test Case ditandai `Fail`, pop-up Bug Report otomatis muncul dan tertaut ke Test Case tersebut.

### 3.2. Mode Luring (Offline Caching)

Firebase Firestore memiliki kapabilitas offline persistence yang aktif secara default pada perangkat mobile. Saat offline, tester tetap dapat membaca Test Case yang ter-cache dan mengeksekusi pengujian. Perubahan disimpan sementara di SQLite lokal dan disinkronkan otomatis ke cloud begitu koneksi pulih.

### 3.3. Pelacakan Bug Minimalis

- **Formulir:** Judul, Deskripsi, dan Severity (`Critical`, `Major`, `Minor`, `Trivial`)
- **Lampiran:** Gambar dikompresi di sisi-klien sebelum diunggah ke Firebase Storage
- **Kanban Board:** Drag-and-drop status (`Open`, `In Progress`, `Resolved`, `Closed`)

### 3.4. Multi-Project & RBAC

- **Admin:** Kendali penuh atas tagihan dan manajemen anggota
- **Tester:** Membuat pengujian dan melaporkan bug
- **Viewer:** Akses read-only untuk klien atau manajer

---

## 4. Struktur Basis Data

Desain berfokus pada minimalisasi Document Reads agar biaya Firestore tetap rendah.

```json
[
  {
    "collection": "users",
    "documentId": "userId (uid)",
    "fields": {
      "email": "tester@example.com",
      "displayName": "John Doe",
      "entitlement": "free | pro",
      "currentProjectId": "projectId_1"
    }
  },
  {
    "collection": "projects",
    "documentId": "projectId",
    "fields": {
      "name": "E-Commerce App",
      "ownerId": "userId",
      "members": { "userId_1": "admin", "userId_2": "tester" },
      "stats": {
        "totalBugs": 45,
        "openBugs": 12,
        "totalTestCases": 150,
        "passedTestCases": 120
      }
    }
  },
  {
    "collection": "test_scenarios",
    "documentId": "scenarioId",
    "fields": {
      "projectId": "projectId",
      "title": "Modul Checkout",
      "createdBy": "userId"
    }
  },
  {
    "collection": "test_cases",
    "documentId": "testCaseId",
    "fields": {
      "projectId": "projectId",
      "scenarioId": "scenarioId",
      "title": "Verifikasi pembayaran valid",
      "steps": ["Langkah 1", "Langkah 2"],
      "status": "passed | failed | blocked | untested"
    }
  },
  {
    "collection": "bugs",
    "documentId": "bugId",
    "fields": {
      "projectId": "projectId",
      "testCaseId": "testCaseId",
      "title": "Tombol bayar macet",
      "severity": "critical | major | minor",
      "status": "open | in_progress | resolved",
      "attachments": ["url_1", "url_2"]
    }
  }
]
```

---

## 5. Model Langganan & Analisis Profitabilitas

### 5.1. Komparasi Paket Langganan

| Fitur / Parameter         | Starter (Free Forever)     | Pro ($12/Bulan per Tim)             |
| :------------------------ | :------------------------- | :---------------------------------- |
| **Batas Proyek Aktif**    | Maksimal 1 Proyek          | Tidak Terbatas                      |
| **Batas Anggota Tim**     | Maksimal 3 Anggota         | Maks. 10 Anggota (+$2/bulan/ekstra) |
| **Kapasitas Test Case**   | 200 Test Cases / Bulan     | Tidak Terbatas                      |
| **Kapasitas Penyimpanan** | 100 MB Firebase Storage    | 10 GB Firebase Storage              |
| **Pelaporan Lanjutan**    | Analitik Dasar (Pie Chart) | Ekspor Laporan Lengkap (PDF/CSV)    |

### 5.2. Analisis Profitabilitas & Biaya Platform

- **App Store / Google Play:** Google menerapkan potongan 15% untuk pengembang berpendapatan di bawah $1.000.000/tahun → beban $1.80 dari harga $12.
- **RevenueCat (MTR):**
  - Gratis jika MTR < $2.500/bulan.
  - Di atas ambang tersebut, tarif ~1% dari total MTR (≈$0.12 untuk 1 pelanggan Pro).
- **Firebase (estimasi 1 tim Pro):**
  - Penyimpanan 5 GB: ~$0.13/bulan
  - Database Reads 500k: ~$0.30/bulan
  - Bandwidth 5 GB: ~$0.75/bulan
  - **Total: ~$1.18/bulan**

**Kalkulasi Margin per Tim:**

| Item                     | Nilai      |
| :----------------------- | :--------- |
| Harga Jual               | $12.00     |
| (-) Google Store Cut 15% | -$1.80     |
| (-) RevenueCat ~1%       | -$0.12     |
| (-) Firebase Infra       | -$1.18     |
| **Net Profit**           | **~$8.90** |

> Margin kotor ~74% via Google Play, atau ~88% via Stripe di Web.

---

## 6. Pelaporan & Analitik

1. **Health Gauge:** Persentase Test Case lulus vs dieksekusi (Merah < 75% | Hijau > 90%)
2. **Doughnut Chart Bug:** Distribusi status bug (Open, In Progress, Resolved)
3. **Severity Bar Chart:** Distribusi keparahan bug (Critical vs Minor)
4. **Traceability Matrix:** Tautan antara kegagalan pengujian dan tiket bug terkait
5. **Ekspor PDF:** Render laporan sisi-klien menggunakan React-PDF tanpa membebani Firebase Functions

---

## 7. Roadmap

Fitur untuk fase pasca-MVP:

- **Dukungan Markdown:** Formatting teks (bold, code block) pada deskripsi langkah Bug.
- **Perekaman Layar (Loom):** Tombol rekam layar bawaan di aplikasi Web.
- **Webhook Integrations:** Sinkronisasi tiket satu arah ke Jira atau Trello.
- **Kolaborasi Real-time:** Indikator kehadiran saat rekan tim mengedit Test Case yang sama (seperti Google Docs).
- **Generasi Skenario AI:** Input nama fitur → OpenAI mengembalikan draft Test Case secara otomatis.

---

## 8. Panduan Instalasi & Deployment

### 8.1. Prasyarat Sistem

- Node.js v18.x+
- Flutter SDK v3.19+
- Firebase CLI
- Akun RevenueCat dengan API Keys

### 8.2. Konfigurasi Backend (Firebase)

```bash
# Login & inisialisasi Firebase
firebase login
firebase init

# Deploy Cloud Functions
cd functions && npm install
firebase deploy --only functions
```

> Wajib mengatur **Security Rules** di Firestore untuk memastikan pengguna hanya dapat mengakses proyek miliknya sendiri.

### 8.3. Menjalankan Client Web (React)

```bash
cd web-client
npm install
# Buat file .env dengan variabel:
# VITE_FIREBASE_API_KEY dan VITE_REVENUECAT_PUBLIC_KEY
npm run dev
```

### 8.4. Menjalankan Client Mobile (Flutter)

```bash
cd mobile-app
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
flutter run
```

---

_Copyright © QALite Development Team_
