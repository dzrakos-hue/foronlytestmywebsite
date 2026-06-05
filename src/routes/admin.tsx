import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/admin.functions";
import { setAdminCredentials, getAdminCredentials } from "@/lib/admin-session";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "تسجيل دخول الإدارة — AUTOLUXE" }, { name: "robots", content: "noindex" }] }),
  component: AdminRoute,
});

function AdminRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/admin") return <AdminLogin />;
  return <Outlet />;
}

function AdminLogin() {
  const navigate = useNavigate();
  const login = useServerFn(adminLogin);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminCredentials()) navigate({ to: "/admin/dashboard" });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") ?? "");
    const password = String(fd.get("password") ?? "");
    setLoading(true);
    try {
      await login({ data: { username, password } });
      setAdminCredentials({ username, password });
      toast.success("مرحبًا بك في لوحة التحكم");
      navigate({ to: "/admin/dashboard" });
    } catch (err: any) {
      toast.error(err?.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 grid place-items-center">
      <div className="w-full max-w-md card-luxe rounded-2xl p-8 animate-fade-up">
        <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary grid place-items-center mb-4">
          <ShieldCheck size={22} />
        </div>
        <h1 className="text-2xl font-black">لوحة الإدارة</h1>
        <p className="text-sm text-muted-foreground mt-1">سجّل الدخول لإدارة السيارات والطلبات.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input id="username" name="username" required maxLength={100} dir="ltr" autoComplete="username" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" name="password" type="password" required maxLength={200} dir="ltr" autoComplete="current-password" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold btn-gold-hover rounded-full px-6 py-3 font-bold inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}
