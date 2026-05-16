# MiCotizador

App SaaS de cotizaciones B2B para climatización.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Deploy**: Vercel

## Setup

### 1. Supabase

1. Crea una cuenta en https://supabase.com
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y pega el contenido de `supabase-schema.sql`, luego ejecútalo
4. Ve a **Settings > API** y copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### 2. Variables de entorno

Crea un archivo `.env` (o renombra `.env.example`) en la raíz:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Local dev

```bash
npm install
npm run dev
```

### 4. Deploy en Vercel

1. Ve a https://vercel.com
2. Conecta tu repo de GitHub `IsJotaK/micotizador`
3. Agrega las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy automático

## Funcionalidades

- Login / registro de usuarios
- Configuración de empresa
- CRUD de productos (con datos precargados)
- CRUD de clientes frecuentes
- Cotizaciones en split view con vista previa en vivo
- Vista previa profesional imprimible
- Enviar por email / copiar al portapapeles
- Multi-tenant (cada empresa ve solo sus datos)
