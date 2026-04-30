## Alhana Logistique

تطبيق ويب احترافي لإدارة اللوجستيك وCRM لشركة **مجموعة الهناء التجارية**.

### التقنيات
- **Next.js 15** (App Router) + TypeScript
- Tailwind CSS + (أساس shadcn/ui) + Radix UI
- TanStack Table
- Zustand + React Hook Form + Zod
- MongoDB + Mongoose
- NextAuth.js (Credentials)

## Getting Started

### 1) المتطلبات
- MongoDB يعمل محلياً أو على خادم
- Node.js

### 2) إعداد المتغيرات البيئية
انسخ ملف البيئة:

```bash
cp .env.example .env.local
```

ثم عدّل `MONGODB_URI` و `NEXTAUTH_SECRET`.

### 3) تشغيل السيرفر للتطوير
```bash
npm run dev
```

افتح `http://localhost:3000`.

### تسجيل الدخول
اذهب إلى ` /login ` وسجّل الدخول بحساب موجود في قاعدة البيانات.

### صفحات النظام
- `/dashboard` لوحة القيادة (إحصائيات حية من MongoDB)
- `/fleet` إدارة الأسطول + `/fleet/new`
- `/drivers` السائقون + `/drivers/new`
- `/maintenance` الوثائق والصيانة (+ تفاصيل + طباعة/PDF)
- `/purchases` طلبات المشتريات (+ طباعة/PDF)
- `/reports` التكاليف والتقارير (+ طباعة/PDF)

> ملاحظة: `/orders` و`/trips` متعطّلين مؤقتًا (يرجعوا 404).

### API (CRUD)
- `GET/POST /api/vehicles` و `GET/PATCH/DELETE /api/vehicles/[id]`
- `GET/POST /api/drivers` و `GET/PATCH/DELETE /api/drivers/[id]`
- `GET/POST /api/clients` و `GET/PATCH/DELETE /api/clients/[id]`
- `GET /api/dashboard/metrics`
- `GET /api/reports/summary`

> ملاحظة: `/api/orders*` متعطّلة مؤقتًا (ترجع 410).

## Auth (Login-only)
- هذا المشروع مضبوط حاليًا على **تسجيل دخول فقط** (لا توجد صفحة تسجيل حساب للمستخدمين).
- إنشاء المستخدمين يتم عبر إضافة شاشة إدارة مستخدمين أو عبر عملية admin داخل الشركة.

## Build (Production)
```bash
npm run build
npm start
```

## Docker (Production)
يشغّل التطبيق + MongoDB معًا:

```bash
docker-compose up -d --build
```

افتح `http://localhost:3001` (تقدر تغيّر المنفذ):

```bash
APP_PORT=3000 docker-compose up -d --build
```

## ملاحظات
- الحماية تتم داخل `src/app/(app)/layout.tsx` عبر `getServerSession` (Node runtime).
- لا يزال بإمكانك توسيع الشاشات حسب احتياج الشركة.
# alhana
