import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Car as CarIcon, Inbox, Plus, Save, Trash2, RefreshCw, Settings, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  adminVerifySession, adminListOrders, adminListCars, adminUpdateCar, adminCreateCar,
  adminListFormFields, adminUpsertFormField, adminDeleteFormField,
  adminGetSiteSettings, adminUpdateSiteSettings,
} from "@/lib/admin.functions";
import { getAdminCredentials, clearAdminPassword } from "@/lib/admin-session";
import { formatPrice } from "@/data/car-assets";
import { CarImageUpload } from "@/components/CarImageUpload";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — AUTOLUXE" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const verifySession = useServerFn(adminVerifySession);
  const [pwd, setPwd] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    const credentials = getAdminCredentials();
    if (!credentials) {
      navigate({ to: "/admin" });
      return;
    }
    verifySession({ data: { password: credentials.password } })
      .then(() => {
        if (!alive) return;
        setPwd(credentials.password);
        setChecking(false);
      })
      .catch(() => {
        clearAdminPassword();
        toast.error("بيانات الأدمن غير صحيحة، سجّل الدخول من جديد");
        navigate({ to: "/admin" });
      });
    return () => { alive = false; };
  }, [navigate]);

  if (checking || !pwd) {
    return (
      <div className="container mx-auto px-4 py-24 grid place-items-center text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  function logout() {
    clearAdminPassword();
    navigate({ to: "/admin" });
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl font-black">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة السيارات، الطلبات، وحقول النموذج.</p>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
          <LogOut size={16} /> تسجيل خروج
        </button>
      </div>

      <Tabs defaultValue="orders" dir="rtl">
        <TabsList className="grid grid-cols-3 max-w-xl">
          <TabsTrigger value="orders" className="gap-2"><Inbox size={16} /> الطلبات</TabsTrigger>
          <TabsTrigger value="cars" className="gap-2"><CarIcon size={16} /> السيارات</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings size={16} /> الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6"><OrdersTab pwd={pwd} /></TabsContent>
        <TabsContent value="cars" className="mt-6"><CarsTab pwd={pwd} /></TabsContent>
        <TabsContent value="settings" className="mt-6"><SettingsTab pwd={pwd} /></TabsContent>
      </Tabs>
    </div>
  );
}

const specFields = [
  { key: "engine", label: "المحرك" },
  { key: "power", label: "القوة" },
  { key: "transmission", label: "ناقل الحركة" },
  { key: "drive", label: "نظام الدفع" },
  { key: "acceleration", label: "التسارع" },
  { key: "topSpeed", label: "السرعة القصوى" },
  { key: "fuel", label: "الوقود" },
  { key: "seats", label: "المقاعد" },
] as const;

function emptySpecs() {
  return Object.fromEntries(specFields.map((s) => [s.key, ""])) as Record<(typeof specFields)[number]["key"], string>;
}

/* ---------------- ORDERS ---------------- */
function OrdersTab({ pwd }: { pwd: string }) {
  const fetchOrders = useServerFn(adminListOrders);
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin_orders"],
    queryFn: () => fetchOrders({ data: { password: pwd } }),
  });

  return (
    <div className="card-luxe rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">جميع الطلبات ({data.length})</h2>
        <button onClick={() => refetch()} className="text-sm inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> تحديث
        </button>
      </div>
      {isLoading ? (
        <div className="py-10 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">لا توجد طلبات حتى الآن.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-right text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="p-2">التاريخ</th>
                <th className="p-2">الاسم</th>
                <th className="p-2">الهاتف</th>
                <th className="p-2">المدينة</th>
                <th className="p-2">العنوان</th>
                <th className="p-2">السيارة</th>
                <th className="p-2">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o: any) => (
                <tr key={o.id} className="border-b border-border/40 align-top">
                  <td className="p-2 whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("ar-DZ")}
                  </td>
                  <td className="p-2 font-medium">{o.first_name} {o.last_name}</td>
                  <td className="p-2" dir="ltr">{o.phone}</td>
                  <td className="p-2">{o.city}</td>
                  <td className="p-2 max-w-[200px]">{o.address}</td>
                  <td className="p-2 text-primary">{o.car_name}</td>
                  <td className="p-2 max-w-[260px] text-xs text-muted-foreground">{o.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- CARS ---------------- */
function CarsTab({ pwd }: { pwd: string }) {
  const fetchCars = useServerFn(adminListCars);
  const updateCar = useServerFn(adminUpdateCar);
  const createCar = useServerFn(adminCreateCar);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_cars"],
    queryFn: () => fetchCars({ data: { password: pwd } }),
  });

  function invalidateCarData(id?: string) {
    qc.invalidateQueries({ queryKey: ["admin_cars"] });
    qc.invalidateQueries({ queryKey: ["cars"] });
    if (id) qc.invalidateQueries({ queryKey: ["car", id] });
  }

  return (
    <div className="grid gap-4">
      <NewCarForm
        pwd={pwd}
        onCreate={async (car) => {
          try {
            const result = await createCar({ data: { password: pwd, car } });
            toast.success("تمت إضافة السيارة");
            invalidateCarData(result.id);
          } catch (e: any) {
            toast.error(e?.message || "فشل إضافة السيارة");
          }
        }}
      />
      {isLoading ? (
        <div className="py-10 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        data.map((c: any) => (
          <CarEditor
            key={c.id}
            pwd={pwd}
            car={c}
            onSave={async (patch) => {
              try {
                await updateCar({ data: { password: pwd, id: c.id, patch } });
                toast.success("تم حفظ التغييرات");
                invalidateCarData(c.id);
              } catch (e: any) {
                toast.error(e?.message || "فشل الحفظ");
              }
            }}
          />
        ))
      )}
    </div>
  );
}

function CarEditor({ pwd, car, onSave }: { pwd: string; car: any; onSave: (patch: any) => Promise<void> }) {
  const [name, setName] = useState(car.name);
  const [brand, setBrand] = useState(car.brand);
  const [price, setPrice] = useState(String(car.price));
  const [year, setYear] = useState(String(car.year));
  const [category, setCategory] = useState(car.category);
  const [shortDesc, setShortDesc] = useState(car.short_desc);
  const [sortOrder, setSortOrder] = useState(String(car.sort_order ?? 0));
  const [images, setImages] = useState<string[]>(Array.isArray(car.images) ? car.images : ["car-1"]);
  const [specs, setSpecs] = useState<Record<(typeof specFields)[number]["key"], string>>({ ...emptySpecs(), ...(car.specs ?? {}) });
  const [active, setActive] = useState(car.active);
  const [saving, setSaving] = useState(false);

  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground">{brand}</div>
          <div className="font-bold">{name}</div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{active ? "ظاهرة" : "مخفية"}</span>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <FieldCol label="الاسم"><Input value={name} onChange={(e) => setName(e.target.value)} /></FieldCol>
        <FieldCol label="الماركة"><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></FieldCol>
        <FieldCol label="السعر (دج)"><Input value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" inputMode="numeric" /></FieldCol>
        <FieldCol label="السنة"><Input value={year} onChange={(e) => setYear(e.target.value)} dir="ltr" inputMode="numeric" /></FieldCol>
        <FieldCol label="الفئة"><Input value={category} onChange={(e) => setCategory(e.target.value)} /></FieldCol>
        <FieldCol label="الترتيب"><Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} dir="ltr" inputMode="numeric" /></FieldCol>
        <div className="sm:col-span-2 lg:col-span-3">
          <FieldCol label="وصف مختصر"><Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={3} /></FieldCol>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <FieldCol label="صور السيارة">
            <CarImageUpload password={pwd} images={images} onChange={setImages} />
          </FieldCol>
        </div>
      </div>
      <div className="mt-5 border-t border-border/60 pt-4">
        <h3 className="font-bold mb-3">خصائص السيارة</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {specFields.map((s) => (
            <FieldCol key={s.key} label={s.label}>
              <Input value={specs[s.key] ?? ""} onChange={(e) => setSpecs((prev) => ({ ...prev, [s.key]: e.target.value }))} />
            </FieldCol>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">السعر الحالي: <span className="text-primary font-bold">{formatPrice(Number(price) || 0)}</span></div>
        <button
          disabled={saving}
          onClick={async () => {
            const p = Number(price); const y = Number(year);
            if (!Number.isFinite(p) || p < 0) { toast.error("سعر غير صالح"); return; }
            if (!Number.isFinite(y)) { toast.error("سنة غير صالحة"); return; }
            if (images.length === 0) { toast.error("أضف صورة واحدة على الأقل"); return; }
            setSaving(true);
            await onSave({
              name, brand, price: Math.floor(p), year: Math.floor(y), category,
              short_desc: shortDesc, active, sort_order: Number(sortOrder) || 0,
              images: images.slice(0, 6), specs,
            });
            setSaving(false);
          }}
          className="btn-gold btn-gold-hover rounded-full px-5 py-2 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} حفظ
        </button>
      </div>
    </div>
  );
}

type NewCarPayload = {
  name: string; brand: string; price: number; year: number; category: string; short_desc: string;
  images: string[]; specs: Record<string, string>; active: boolean;
};

function NewCarForm({ pwd, onCreate }: { pwd: string; onCreate: (car: NewCarPayload) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("2025");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState(emptySpecs());
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="card-luxe rounded-2xl p-4 inline-flex items-center justify-center gap-2 font-bold hover:bg-accent">
        <Plus size={18} /> إضافة سيارة جديدة
      </button>
    );
  }

  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="font-bold">سيارة جديدة</h3>
          <p className="text-xs text-muted-foreground mt-1">املأ البيانات والخصائص؛ يمكن ترك الخصائص فارغة وتعديلها لاحقًا.</p>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">إلغاء</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FieldCol label="اسم السيارة"><Input value={name} onChange={(e) => setName(e.target.value)} /></FieldCol>
        <FieldCol label="الماركة"><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></FieldCol>
        <FieldCol label="السعر (دج)"><Input value={price} onChange={(e) => setPrice(e.target.value)} dir="ltr" inputMode="numeric" /></FieldCol>
        <FieldCol label="السنة"><Input value={year} onChange={(e) => setYear(e.target.value)} dir="ltr" inputMode="numeric" /></FieldCol>
        <FieldCol label="الفئة"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="SUV / سيدان / رياضية" /></FieldCol>
        <div className="sm:col-span-2 lg:col-span-3">
          <FieldCol label="وصف مختصر"><Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={3} /></FieldCol>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <FieldCol label="صور السيارة">
            <CarImageUpload password={pwd} images={images} onChange={setImages} />
          </FieldCol>
        </div>
      </div>
      <div className="mt-5 border-t border-border/60 pt-4">
        <h4 className="font-bold mb-3">خانات الخصائص</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {specFields.map((s) => (
            <FieldCol key={s.key} label={s.label}>
              <Input value={specs[s.key]} onChange={(e) => setSpecs((prev) => ({ ...prev, [s.key]: e.target.value }))} />
            </FieldCol>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          disabled={saving}
          onClick={async () => {
            const p = Number(price); const y = Number(year);
            if (!name.trim() || !brand.trim() || !category.trim() || !shortDesc.trim()) { toast.error("أكمل بيانات السيارة الأساسية"); return; }
            if (!Number.isFinite(p) || p < 0) { toast.error("سعر غير صالح"); return; }
            if (!Number.isFinite(y)) { toast.error("سنة غير صالحة"); return; }
            if (images.length === 0) { toast.error("أضف صورة واحدة على الأقل"); return; }
            setSaving(true);
            await onCreate({ name, brand, price: Math.floor(p), year: Math.floor(y), category, short_desc: shortDesc, images: images.slice(0, 6), specs, active: true });
            setSaving(false);
            setOpen(false); setName(""); setBrand(""); setPrice(""); setYear("2025"); setCategory(""); setShortDesc(""); setImages([]); setSpecs(emptySpecs());
          }}
          className="btn-gold btn-gold-hover rounded-full px-5 py-2 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} إضافة السيارة
        </button>
      </div>
    </div>
  );
}

function FieldCol({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* ---------------- SETTINGS + FORM FIELDS ---------------- */
function SettingsTab({ pwd }: { pwd: string }) {
  return (
    <div className="grid gap-6">
      <SiteNameSettings pwd={pwd} />
      <FieldsManager pwd={pwd} />
    </div>
  );
}

function SiteNameSettings({ pwd }: { pwd: string }) {
  const fetchSettings = useServerFn(adminGetSiteSettings);
  const updateSettings = useServerFn(adminUpdateSiteSettings);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin_site_settings"],
    queryFn: () => fetchSettings({ data: { password: pwd } }),
  });
  const [siteName, setSiteName] = useState("AUTOLUXE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.site_name) setSiteName(data.site_name);
  }, [data?.site_name]);

  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary grid place-items-center"><Settings size={18} /></div>
        <div>
          <h2 className="font-bold">إعدادات الموقع</h2>
          <p className="text-sm text-muted-foreground mt-1">غيّر اسم الموقع الظاهر في الواجهة.</p>
        </div>
      </div>
      {isLoading ? (
        <div className="py-8 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <FieldCol label="اسم الموقع"><Input value={siteName} onChange={(e) => setSiteName(e.target.value)} maxLength={80} /></FieldCol>
          <button
            disabled={saving}
            onClick={async () => {
              if (!siteName.trim()) { toast.error("اسم الموقع مطلوب"); return; }
              setSaving(true);
              try {
                await updateSettings({ data: { password: pwd, site_name: siteName.trim() } });
                toast.success("تم حفظ اسم الموقع");
                qc.invalidateQueries({ queryKey: ["admin_site_settings"] });
                qc.invalidateQueries({ queryKey: ["site_settings"] });
              } catch (e: any) {
                toast.error(e?.message || "فشل حفظ الإعدادات");
              } finally {
                setSaving(false);
              }
            }}
            className="btn-gold btn-gold-hover rounded-full px-5 py-2 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} حفظ
          </button>
        </div>
      )}
    </div>
  );
}

function FieldsManager({ pwd }: { pwd: string }) {
  const fetchFields = useServerFn(adminListFormFields);
  const upsert = useServerFn(adminUpsertFormField);
  const remove = useServerFn(adminDeleteFormField);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin_fields"],
    queryFn: () => fetchFields({ data: { password: pwd } }),
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin_fields"] });
    qc.invalidateQueries({ queryKey: ["form_fields_active"] });
  }

  return (
    <div className="grid gap-4">
      <div className="card-luxe rounded-2xl p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary grid place-items-center"><ShieldAlert size={18} /></div>
        <div>
          <h2 className="font-bold">نموذج الطلب</h2>
          <p className="text-sm text-muted-foreground mt-1">أضف وعدّل الأسئلة التي تظهر للزبون عند طلب سيارة.</p>
        </div>
      </div>
      <NewFieldForm
        existingCount={data.length}
        onCreate={async (payload) => {
          try {
            await upsert({ data: { password: pwd, ...payload } });
            toast.success("تمت إضافة الحقل");
            invalidate();
          } catch (e: any) {
            toast.error(e?.message || "فشل الإضافة");
          }
        }}
      />
      {isLoading ? (
        <div className="py-10 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        data.map((f: any) => (
          <FieldEditor
            key={f.id}
            field={f}
            onSave={async (payload) => {
              try {
                await upsert({ data: { password: pwd, id: f.id, ...payload } });
                toast.success("تم الحفظ");
                invalidate();
              } catch (e: any) {
                toast.error(e?.message || "فشل الحفظ");
              }
            }}
            onDelete={async () => {
              if (!confirm("هل تريد حذف هذا الحقل؟")) return;
              try {
                await remove({ data: { password: pwd, id: f.id } });
                toast.success("تم الحذف");
                invalidate();
              } catch (e: any) {
                toast.error(e?.message || "فشل الحذف");
              }
            }}
          />
        ))
      )}
    </div>
  );
}

type FieldPayload = {
  name: string; label: string; type: "text" | "tel" | "email" | "textarea" | "number";
  required: boolean; placeholder: string | null; sort_order: number; active: boolean;
};

function FieldEditor({ field, onSave, onDelete }: { field: any; onSave: (p: FieldPayload) => Promise<void>; onDelete: () => Promise<void> }) {
  const [label, setLabel] = useState(field.label);
  const [type, setType] = useState(field.type);
  const [required, setRequired] = useState(field.required);
  const [placeholder, setPlaceholder] = useState(field.placeholder ?? "");
  const [sortOrder, setSortOrder] = useState(String(field.sort_order));
  const [active, setActive] = useState(field.active);
  const [saving, setSaving] = useState(false);

  return (
    <div className="card-luxe rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-muted-foreground">الاسم التقني: <code dir="ltr">{field.name}</code></div>
          <div className="font-bold">{label}</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{active ? "مفعّل" : "معطّل"}</span>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <button onClick={onDelete} className="text-destructive hover:opacity-80 inline-flex items-center gap-1 text-sm">
            <Trash2 size={14} /> حذف
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <FieldCol label="السؤال المعروض"><Input value={label} onChange={(e) => setLabel(e.target.value)} /></FieldCol>
        <FieldCol label="النوع">
          <select value={type} onChange={(e) => setType(e.target.value as any)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="text">نص</option>
            <option value="tel">هاتف</option>
            <option value="email">بريد إلكتروني</option>
            <option value="number">رقم</option>
            <option value="textarea">نص طويل</option>
          </select>
        </FieldCol>
        <FieldCol label="نص توضيحي (placeholder)"><Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} /></FieldCol>
        <FieldCol label="الترتيب"><Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} dir="ltr" inputMode="numeric" /></FieldCol>
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">إلزامي</Label>
          <div className="h-9 flex items-center"><Switch checked={required} onCheckedChange={setRequired} /></div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave({
              name: field.name, label, type, required,
              placeholder: placeholder || null,
              sort_order: Number(sortOrder) || 0,
              active,
            });
            setSaving(false);
          }}
          className="btn-gold btn-gold-hover rounded-full px-5 py-2 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} حفظ
        </button>
      </div>
    </div>
  );
}

function NewFieldForm({ onCreate, existingCount }: { onCreate: (p: FieldPayload) => Promise<void>; existingCount: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldPayload["type"]>("text");
  const [required, setRequired] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="card-luxe rounded-2xl p-4 inline-flex items-center justify-center gap-2 font-bold hover:bg-accent">
        <Plus size={18} /> إضافة سؤال جديد للنموذج
      </button>
    );
  }

  return (
    <div className="card-luxe rounded-2xl p-5">
      <h3 className="font-bold mb-3">سؤال جديد</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <FieldCol label="السؤال المعروض"><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: تاريخ الميلاد" /></FieldCol>
        <FieldCol label="الاسم التقني (إنجليزي)"><Input value={name} onChange={(e) => setName(e.target.value)} dir="ltr" placeholder="birth_date" /></FieldCol>
        <FieldCol label="النوع">
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="text">نص</option>
            <option value="tel">هاتف</option>
            <option value="email">بريد إلكتروني</option>
            <option value="number">رقم</option>
            <option value="textarea">نص طويل</option>
          </select>
        </FieldCol>
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">إلزامي</Label>
          <div className="h-9 flex items-center"><Switch checked={required} onCheckedChange={setRequired} /></div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">إلغاء</button>
        <button
          disabled={saving}
          onClick={async () => {
            if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) { toast.error("الاسم التقني: حروف إنجليزية وأرقام فقط (يبدأ بحرف)"); return; }
            if (!label.trim()) { toast.error("اكتب نص السؤال"); return; }
            setSaving(true);
            await onCreate({ name, label, type, required, placeholder: null, sort_order: existingCount + 1, active: true });
            setSaving(false);
            setOpen(false); setName(""); setLabel(""); setType("text"); setRequired(true);
          }}
          className="btn-gold btn-gold-hover rounded-full px-5 py-2 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} إضافة
        </button>
      </div>
    </div>
  );
}
