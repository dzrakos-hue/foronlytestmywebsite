import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listActiveFormFields } from "@/lib/form-fields.functions";
import { submitOrder } from "@/lib/orders.functions";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  carId: string;
  carName: string;
};

export function OrderDialog({ open, onOpenChange, carId, carName }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fetchFields = useServerFn(listActiveFormFields);
  const sendOrder = useServerFn(submitOrder);
  const { data: fields = [] } = useQuery({
    queryKey: ["form_fields_active"],
    queryFn: () => fetchFields(),
    enabled: open,
  });

  useEffect(() => { if (open) setDone(false); }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Known columns on orders table
    const known = new Set(["first_name", "last_name", "phone", "city", "address", "notes"]);
    const payload: Record<string, string> = {
      first_name: "", last_name: "", phone: "", city: "", address: "",
    };
    const extras: Record<string, string> = {};
    let extraNotes = "";

    for (const f of fields) {
      const val = String(fd.get(f.name) ?? "").trim();
      if (f.required && !val) {
        toast.error(`${f.label} مطلوب`);
        return;
      }
      if (val.length > 1000) {
        toast.error(`${f.label} طويل جدًا`);
        return;
      }
      if (known.has(f.name)) {
        payload[f.name] = val;
      } else {
        extras[f.label] = val;
      }
    }

    for (const k of ["first_name", "last_name", "city", "address"]) {
      if (!payload[k]) payload[k] = "—";
    }
    if (!payload.phone) {
      toast.error("رقم الهاتف مطلوب");
      return;
    }
    if (payload.phone.length < 4) {
      toast.error("رقم الهاتف قصير جدًا (4 أرقام على الأقل)");
      return;
    }

    const notesVal = String(fd.get("notes") ?? "").trim();
    if (notesVal) extraNotes = notesVal;
    const extrasText = Object.entries(extras)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    const finalNotes = [extraNotes, extrasText].filter(Boolean).join(" || ").slice(0, 1000);

    setLoading(true);
    try {
      await sendOrder({
        data: {
          first_name: payload.first_name.slice(0, 100),
          last_name: payload.last_name.slice(0, 100),
          phone: payload.phone.slice(0, 30),
          city: payload.city.slice(0, 100),
          address: payload.address.slice(0, 500),
          notes: finalNotes || null,
          car_id: carId,
          car_name: carName,
        },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "حدث خطأ أثناء إرسال الطلب. حاول مجددًا.";
      toast.error(message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setDone(true);
    toast.success("تم إرسال طلبك بنجاح، سنتواصل معك قريبًا.");
    setTimeout(() => {
      onOpenChange(false);
    }, 1800);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">اطلب هذه السيارة</DialogTitle>
          <DialogDescription>
            {carName} — املأ النموذج وسيتواصل معك فريقنا في أقرب وقت.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-10 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="text-primary" size={56} />
            <p className="font-semibold">تم استلام طلبك</p>
            <p className="text-sm text-muted-foreground">شكرًا لثقتك بنا.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            {fields.map((f) => (
              <div key={f.id} className="grid gap-1.5">
                <Label htmlFor={f.name}>
                  {f.label} {f.required && <span className="text-primary">*</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    name={f.name}
                    rows={3}
                    maxLength={1000}
                    placeholder={f.placeholder ?? ""}
                  />
                ) : (
                  <Input
                    id={f.name}
                    name={f.name}
                    type={f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.type === "number" ? "number" : "text"}
                    required={f.required}
                    maxLength={500}
                    placeholder={f.placeholder ?? ""}
                    dir={f.type === "tel" || f.type === "email" || f.type === "number" ? "ltr" : undefined}
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <button
                type="submit"
                disabled={loading || fields.length === 0}
                className="btn-gold btn-gold-hover w-full rounded-full px-6 py-3 text-base font-bold inline-flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                إرسال الطلب
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
