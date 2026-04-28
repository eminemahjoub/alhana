"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Attachment = { url: string; name?: string; mime?: string };

export function PurchaseWorkflowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [paymentRef, setPaymentRef] = React.useState("");

  const [receiptAtts, setReceiptAtts] = React.useState<Attachment[]>([]);
  const [invoiceAtts, setInvoiceAtts] = React.useState<Attachment[]>([]);
  const [paymentAtts, setPaymentAtts] = React.useState<Attachment[]>([]);

  async function upload(files: FileList, setter: (v: Attachment[]) => void, current: Attachment[]) {
    setUploading(true);
    try {
      const next = [...current];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { url?: string }; message?: string } | null;
        if (!res.ok || !json?.ok || !json.data?.url) throw new Error(json?.message ?? "Upload failed");
        next.push({ url: json.data.url, name: f.name, mime: f.type });
      }
      setter(next);
      toast("تم رفع المرفقات");
    } catch {
      toast("تعذر رفع المرفقات");
    } finally {
      setUploading(false);
    }
  }

  async function act(payload: Record<string, unknown>) {
    setBusy(String(payload.action ?? "action"));
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !json?.ok) throw new Error(json?.message ?? "Failed");
      toast("تم تحديث حالة الطلب");
      window.location.reload();
    } catch {
      toast("تعذر تحديث الحالة");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-background/30 p-4">
        <div className="text-sm font-bold">الخطوات</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={busy !== null || status !== "submitted"} onClick={() => void act({ action: "approve" })}>
            موافقة
          </Button>
          <Button type="button" variant="outline" disabled={busy !== null || status !== "approved"} onClick={() => void act({ action: "order" })}>
            تم الطلب
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null || status !== "ordered"}
            onClick={() => void act({ action: "receive", receiptAttachments: receiptAtts })}
          >
            استلام
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null || status !== "received"}
            onClick={() => void act({ action: "invoice", invoiceNumber, invoiceAttachments: invoiceAtts })}
          >
            فاتورة
          </Button>
          <Button
            type="button"
            disabled={busy !== null || status !== "invoiced"}
            onClick={() => void act({ action: "pay", paymentMethod, paymentRef, paymentAttachments: paymentAtts })}
          >
            دفع
          </Button>
          <Button type="button" variant="outline" disabled={busy !== null || status === "paid" || status === "cancelled"} onClick={() => void act({ action: "cancel" })}>
            إلغاء
          </Button>
        </div>
        {busy ? <div className="mt-2 text-xs text-muted-foreground">جارٍ التنفيذ…</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">مرفقات الاستلام</div>
          <div className="mt-3 space-y-2">
            <Label>رفع</Label>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              disabled={uploading}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files, setReceiptAtts, receiptAtts);
              }}
            />
            {receiptAtts.length ? (
              <div className="space-y-1">
                {receiptAtts.map((a, idx) => (
                  <div key={a.url + idx} className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2 text-xs">
                    <a className="font-semibold underline" href={a.url} target="_blank" rel="noreferrer">
                      {a.name ?? "مرفق"}
                    </a>
                    <button type="button" className="underline" onClick={() => setReceiptAtts(receiptAtts.filter((_, i) => i !== idx))}>
                      إزالة
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">الفاتورة</div>
          <div className="mt-3 space-y-2">
            <Label>رقم الفاتورة</Label>
            <input
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-..."
              dir="ltr"
            />
            <Label>مرفقات</Label>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              disabled={uploading}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files, setInvoiceAtts, invoiceAtts);
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-background/30 p-4">
          <div className="text-sm font-bold">الدفع</div>
          <div className="mt-3 space-y-2">
            <Label>طريقة الدفع</Label>
            <input
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="تحويل/نقد..."
            />
            <Label>مرجع/رقم</Label>
            <input
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="REF..."
              dir="ltr"
            />
            <Label>مرفقات</Label>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              disabled={uploading}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border file:bg-card/60 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-muted"
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files, setPaymentAtts, paymentAtts);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

