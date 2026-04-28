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
- `/orders` طلبات النقل + `/orders/new`
- `/trips` الرحلات والتتبع (قالب جاهز)
- `/maintenance` الوثائق والصيانة (قالب جاهز)
- `/reports` التكاليف والتقارير (قالب جاهز)

### API (CRUD)
- `GET/POST /api/vehicles` و `GET/PATCH/DELETE /api/vehicles/[id]`
- `GET/POST /api/drivers` و `GET/PATCH/DELETE /api/drivers/[id]`
- `GET/POST /api/clients` و `GET/PATCH/DELETE /api/clients/[id]`
- `GET/POST /api/orders` و `GET/PATCH/DELETE /api/orders/[id]`
- `GET /api/dashboard/metrics`

## Auth (Login-only)
- هذا المشروع مضبوط حاليًا على **تسجيل دخول فقط** (لا توجد صفحة تسجيل حساب للمستخدمين).
- إنشاء المستخدمين يتم عبر إضافة شاشة إدارة مستخدمين أو عبر عملية admin داخل الشركة.

## Build (Production)
```bash
npm run build
npm start
```

## ملاحظات
- الحماية تتم داخل `src/app/(app)/layout.tsx` عبر `getServerSession` (Node runtime).
- لا يزال بإمكانك توسيع الشاشات (Trips/Maintenance/Reports) وربطها بالـ CRUD والجداول حسب احتياج الشركة.
# alhana
