// Uso puntual: crea una cuenta de cliente con contraseña fija (sin invitación
// por email), replicando adminInviteClient de src/lib/admin.functions.ts.
// No escribas la Service Role Key en ningún archivo: pásala solo por env var.
//
//   set -a; source .env; set +a
//   SUPABASE_SERVICE_ROLE_KEY="..." CLIENT_PASSWORD="..." \
//     CLIENT_EMAIL="cliente@tunuevavida.com" CLIENT_FULL_NAME="Cliente Prueba" \
//     node scripts/create-test-client.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL ?? "cliente@tunuevavida.com";
const CLIENT_PASSWORD = process.env.CLIENT_PASSWORD;
const CLIENT_FULL_NAME = process.env.CLIENT_FULL_NAME ?? "Cliente de prueba";
const COACH_ID = process.env.COACH_ID || null;

for (const [name, value] of [
  ["SUPABASE_URL", SUPABASE_URL],
  ["SUPABASE_SERVICE_ROLE_KEY", SERVICE_ROLE_KEY],
  ["CLIENT_PASSWORD", CLIENT_PASSWORD],
]) {
  if (!value) {
    console.error(`Falta la variable de entorno ${name}.`);
    process.exit(1);
  }
}

// Las claves nuevas de Supabase (sb_secret_...) son opacas, no JWT: si se
// manda también como Bearer, la API las rechaza. Mismo workaround que
// src/integrations/supabase/client.server.ts.
function isNewSupabaseApiKey(value) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

const customFetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (isNewSupabaseApiKey(SERVICE_ROLE_KEY) && headers.get("Authorization") === `Bearer ${SERVICE_ROLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SERVICE_ROLE_KEY);
  return fetch(input, { ...init, headers });
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { fetch: customFetch },
  auth: { persistSession: false, autoRefreshToken: false },
});

async function rollback(userId) {
  await admin.auth.admin.deleteUser(userId).catch(() => {});
}

async function main() {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: CLIENT_EMAIL,
    password: CLIENT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: CLIENT_FULL_NAME },
  });
  if (createError || !created.user) {
    if ((createError?.message ?? "").toLowerCase().includes("already")) {
      throw new Error("Ese correo ya tiene una cuenta.");
    }
    throw new Error(`No se pudo crear la cuenta: ${createError?.message}`);
  }
  const clientId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: clientId,
    role: "client",
    full_name: CLIENT_FULL_NAME,
    program_start_date: new Date().toISOString().slice(0, 10),
    status: "active",
  });
  if (profileError) {
    await rollback(clientId);
    throw new Error(`No se pudo crear el perfil: ${profileError.message}`);
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: clientId, role: "client" });
  if (roleError) {
    await rollback(clientId);
    throw new Error(`No se pudo asignar el rol: ${roleError.message}`);
  }

  const { error: initError } = await admin.rpc("initialize_client_progress", {
    _user_id: clientId,
  });
  if (initError) {
    await rollback(clientId);
    throw new Error(`No se pudo inicializar el progreso: ${initError.message}`);
  }

  if (COACH_ID) {
    const { error: assignError } = await admin.from("coach_clients").insert({
      coach_id: COACH_ID,
      client_id: clientId,
      status: "active",
    });
    if (assignError) {
      console.warn(`Cuenta creada, pero no se pudo asignar el coach: ${assignError.message}`);
    }
  }

  console.log("Cuenta creada correctamente.");
  console.log(`  email: ${CLIENT_EMAIL}`);
  console.log(`  user_id: ${clientId}`);
  console.log(`  coach asignado: ${COACH_ID ? "sí" : "no"}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
