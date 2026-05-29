# Docketlaw — Law Firm Management System

ระบบจัดการสำนักงานกฎหมาย ประกอบด้วย 2 โปรเจคหลัก

---

## Projects

| โปรเจค | คำอธิบาย |
|---|---|
| `vue.lawfirm.docketlaw` | แอปหลักสำหรับผู้ใช้งาน (ทนายความ / พนักงาน) |
| `vue.lawfirm.admin` | แผงควบคุมสำหรับผู้ดูแลระบบ |

---

## Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Library:** PrimeVue
- **State Management:** Pinia
- **Router:** Vue Router
- **HTTP Client:** Axios
- **Editor:** CKEditor 5
- **Charts:** Chart.js
- **Animation:** GSAP, Lottie
- **Calendar:** Toast UI Calendar
- **Linting:** ESLint + OXLint + Prettier

---

## vue.lawfirm.docketlaw

แอปสำหรับผู้ใช้งานในสำนักงาน รองรับ:

- **Overview** — ภาพรวมและ Dashboard
- **Cases** — จัดการคดีความ
- **Calendar** — ปฏิทินนัดหมาย
- **Employee** — จัดการข้อมูลพนักงาน
- **Storage** — จัดการไฟล์เอกสาร
- **OCR** — แปลงเอกสารด้วย OCR
- **Packages** — จัดการแพ็กเกจบริการ
- **Profile** — จัดการโปรไฟล์ผู้ใช้

### Setup

```bash
cd vue.lawfirm.docketlaw

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ environment
cp .env.example .env.development
```

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript type check
npm run lint         # Lint & fix
npm run format       # Format with Prettier
```

---

## vue.lawfirm.admin

แผงควบคุมสำหรับ Admin รองรับ:

- **Overview** — ภาพรวมระบบ
- **Admin** — จัดการผู้ดูแลระบบ
- **Customer** — จัดการลูกค้า
- **Package** — จัดการแพ็กเกจ
- **Payment** — ติดตามการชำระเงิน

### Setup

```bash
cd vue.lawfirm.admin

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ environment
cp .env.example .env.development
```

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript type check
npm run lint         # Lint & fix
npm run format       # Format with Prettier
```

---

## Environment Variables

ทั้ง 2 โปรเจคใช้ไฟล์ `.env` สำหรับตั้งค่า environment ซึ่ง **ไม่ถูก commit ขึ้น Git** (ดู `.gitignore`)

| ไฟล์ | ใช้กับ |
|---|---|
| `.env` | ค่า default |
| `.env.development` | โหมด development |
| `.env.production` | โหมด production |

---

## Requirements

- Node.js >= 22
- npm >= 10
