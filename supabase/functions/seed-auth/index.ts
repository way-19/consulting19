// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

serve(async (_req) => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service);

  const users = [
    { email: "admin@consulting19.com", password: "SecureAdmin2025!", role: "admin" },
    { email: "georgia@consulting19.com", password: "GeorgiaConsult2025!", role: "consultant" },
    { email: "client.georgia@consulting19.com", password: "ClientGeorgia2025!", role: "client" },
  ];

  const results: any[] = [];
  for (const u of users) {
    // Varsa getir
    const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = existing.data.users.find((x: any) => x.email === u.email);
    if (!found) {
      const created = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role },
      });
      results.push({ email: u.email, action: "created", error: created.error?.message });
    } else {
      // Şifreyi sıfırla ve onaylı say
      await admin.auth.admin.updateUserById(found.id, {
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role },
      });
      results.push({ email: u.email, action: "updated" });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }, null, 2), {
    headers: { "content-type": "application/json" },
  });
});