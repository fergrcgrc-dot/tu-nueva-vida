// Aplica las plantillas de email en español (supabase/email-templates) al
// proyecto. Requiere un proveedor SMTP propio configurado en Supabase: en el
// plan gratuito sin SMTP propio, Supabase no permite cambiar las plantillas.
// Uso: SUPABASE_ACCESS_TOKEN=sbp_… node scripts/apply-email-templates.mjs
import { readFileSync } from "node:fs";

const REF = "zelllkpibcmkeyjhfdys";
const token = process.env.SUPABASE_ACCESS_TOKEN ?? "proxy-injected";
const subjects = JSON.parse(readFileSync("supabase/email-templates/subjects.json", "utf-8"));
const body = {
  mailer_subjects_invite: subjects.invite,
  mailer_templates_invite_content: readFileSync("supabase/email-templates/invite.html", "utf-8"),
  mailer_subjects_recovery: subjects.recovery,
  mailer_templates_recovery_content: readFileSync("supabase/email-templates/recovery.html", "utf-8"),
};
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
console.log(res.status, res.ok ? "Plantillas aplicadas." : await res.text());
