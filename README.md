# App Diagnóstico DORA AI

MVP simple para desplegar un diagnóstico DORA AI 2025 en la nube usando:

- **GitHub** para repositorio y administración del código
- **Vercel** para despliegue continuo
- **Supabase** para almacenamiento y tiempo real
- **React + Vite + Tailwind + Recharts** para la interfaz

## Qué incluye

- `/` → vista asistente
- `/speaker` → vista speaker en vivo
- `/qr` → vista con código QR y enlace para asistentes
- fallback local con `localStorage` si aún no configuras Supabase

## Instalación local

```bash
npm install
npm run dev
```

## Variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_BASE_URL=
VITE_SPEAKER_ACCESS_KEY=
```

### Notas

- Si no defines `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, la app funciona en modo demo local.
- `VITE_APP_BASE_URL` ayuda a que `/qr` genere el enlace correcto en producción.
- `VITE_SPEAKER_ACCESS_KEY` es opcional. Si la defines, `/speaker` pedirá una clave simple.

## Crear la tabla en Supabase

Crea una tabla `responses` con esta estructura mínima en el SQL Editor de Supabase:

```sql
create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  name text not null,
  email text not null,
  answers jsonb not null,
  average_score numeric(3,2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.responses enable row level security;

create policy "Allow anonymous inserts"
on public.responses
for insert
to anon
with check (true);

create policy "Allow anonymous reads"
on public.responses
for select
to anon
using (true);
```

## Despliegue más simple con GitHub + Vercel

1. Crea un repositorio en GitHub.
2. Sube este proyecto.
3. Entra a **Vercel** usando tu cuenta de GitHub.
4. Importa el repositorio.
5. En **Environment Variables**, agrega las variables `VITE_*`.
6. Haz deploy.

## Alternativa de registro más económica y fácil

La app **no crea cuentas para asistentes**.

En vez de eso:

- pide **nombre**
- pide **email**
- guarda respuestas del cuestionario
- asigna un `session_id` automático del navegador

Esto baja costo, reduce fricción y simplifica la operación del evento.

## Validación previa al evento

- prueba ingreso desde varios teléfonos
- abre `/speaker` en una pantalla aparte
- valida que las respuestas nuevas aparezcan sin refrescar
- prueba la ruta `/qr`
- exporta datos desde Supabase luego del ensayo

## Comandos útiles

```bash
npm run dev
npm run build
npm run preview
```