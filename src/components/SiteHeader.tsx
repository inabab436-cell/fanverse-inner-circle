import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export function SiteHeader() {
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const link = "text-sm font-medium text-muted-foreground hover:text-primary transition-colors";
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-display text-xl font-extrabold text-brand">عوالم</Link>
        <nav className="flex items-center gap-4">
          <Link to="/artists" className={link} activeProps={{ className: "text-primary" }}>الفنانون</Link>
          <Link to="/principles" className={link} activeProps={{ className: "text-primary" }}>مبادئنا</Link>
          {user ? (
            <>
              <Link to="/profile" className={link}>ملفي</Link>
              <button onClick={signOut} className="text-sm text-muted-foreground hover:text-accent">خروج</button>
            </>
          ) : (
            <Link to="/auth" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-primary-foreground">دخول</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
