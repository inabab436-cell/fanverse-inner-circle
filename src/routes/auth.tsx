import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "الدخول — عوالم" },
      { name: "description", content: "سجّل دخولك أو أنشئ حسابًا للانضمام لعوالم الفنانين." },
      { property: "og:title", content: "الدخول — عوالم" },
      { property: "og:description", content: "انضم لمجتمع الفانز." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/profile" }); }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: window.location.origin } });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("أرسلنا رابط تأكيد إلى بريدك");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("بيانات الدخول غير صحيحة");
    }
    setBusy(false);
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("تعذّر الدخول بجوجل");
  }

  const input = "w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:border-primary";
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h1 className="text-center text-2xl font-extrabold">{mode === "in" ? "أهلًا بعودتك" : "انضم لعوالم"}</h1>
        <button onClick={google} className="mt-6 w-full rounded-full border border-border py-2.5 font-semibold hover:bg-secondary">المتابعة باستخدام Google</button>
        <div className="my-4 text-center text-xs text-muted-foreground">أو بالبريد</div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك في المجتمع" className={input} />}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className={input} dir="ltr" />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className={input} dir="ltr" />
          <button disabled={busy} className="w-full rounded-full bg-brand py-2.5 font-semibold text-primary-foreground disabled:opacity-60">{mode === "in" ? "دخول" : "إنشاء حساب"}</button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm text-primary">
          {mode === "in" ? "ليس لديك حساب؟ أنشئ واحدًا" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </div>
  );
}
