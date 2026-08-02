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
npm run load:test
```

## Prueba de carga para el día del evento

Puedes simular una audiencia de ~100 asistentes concurrentes sin servicios extra usando el script local:

```bash
npm run load:test -- --total=100 --concurrency=25 --mode=ramp --rampMs=15000 --jitterMs=250 --resetFirst=true --label=ensayo-general
```

### Parámetros disponibles

- `--total=100` → total de respuestas a generar
- `--concurrency=25` → cuántos envíos simultáneos máximos permite el script
- `--mode=ramp` → `ramp` distribuye envíos en el tiempo, `burst` los dispara casi juntos
- `--rampMs=15000` → ventana de distribución total en milisegundos
- `--jitterMs=250` → variación aleatoria para parecer tráfico real
- `--resetFirst=true` → inserta un reset lógico antes de empezar, sin borrar histórico
- `--label=ensayo-general` → prefijo para identificar los datos de la prueba

### Escenarios recomendados

#### 1. Ensayo base

```bash
npm run load:test -- --total=20 --concurrency=10 --mode=ramp --rampMs=10000 --resetFirst=true --label=base
```

#### 2. Simulación del evento

```bash
npm run load:test -- --total=100 --concurrency=25 --mode=ramp --rampMs=15000 --resetFirst=true --label=evento-100
```

#### 3. Pico agresivo

```bash
npm run load:test -- --total=100 --concurrency=100 --mode=burst --jitterMs=100 --resetFirst=true --label=pico-100
```

### Qué mirar durante la prueba

- `/speaker` debe reflejar el aumento de participantes
- el radar debe recalcularse correctamente
- no deberían perderse respuestas
- la tasa de error ideal es `0%`
- latencia promedio ideal: `< 1000 ms`
- latencia máxima aceptable: `< 3000 ms`

### Recomendación práctica

Haz la prueba híbrida así:

1. ejecuta el script de carga
2. abre `/speaker` en una pantalla grande
3. prueba además con `3 a 10` celulares reales al mismo tiempo
4. usa **Reiniciar conteo** antes de cada nuevo escenario

Esto te da una validación realista y económica para el evento.