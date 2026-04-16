# RentApto — Comparador de inversiones inmobiliarias

Aplicación web para comparar apartamentos como inversión en Cali, Colombia.  
Stack: React + Vite + Supabase + Tailwind CSS.

---

## Guía de instalación paso a paso (Windows, sin experiencia previa)

### 1. Instalar Node.js

1. Ve a https://nodejs.org y descarga la versión **LTS** (botón verde grande).
2. Ejecuta el instalador y acepta todo con "Next".
3. Abre **PowerShell** (busca "PowerShell" en el menú Inicio) y verifica:
   ```
   node --version
   npm --version
   ```
   Deberías ver números de versión (ej: `v20.x.x` y `10.x.x`).

### 2. Instalar VS Code (opcional pero recomendado)

1. Ve a https://code.visualstudio.com y descarga el instalador.
2. Instala con las opciones por defecto.
3. Abre la carpeta del proyecto: **File → Open Folder** → selecciona `RentApto`.

### 3. Crear un proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta gratuita.
2. Haz clic en **"New project"**.
3. Elige un nombre (ej: `rentapto`), una contraseña segura, y la región **South America (São Paulo)**.
4. Espera ~2 minutos a que el proyecto se aprovisione.

### 4. Ejecutar el esquema de base de datos

1. En el panel de Supabase, ve a **SQL Editor** (icono de terminal en la barra lateral).
2. Haz clic en **"New query"**.
3. Copia todo el contenido del archivo `schema.sql` de este proyecto.
4. Pégalo en el editor y haz clic en **"Run"** (o presiona Ctrl+Enter).
5. Deberías ver "Success" en verde.

### 5. Obtener las credenciales de Supabase

1. En el panel de Supabase, ve a **Project Settings** (engranaje) → **API**.
2. Copia los valores:
   - **Project URL** → esto es tu `VITE_SUPABASE_URL`
   - **anon / public** key → esto es tu `VITE_SUPABASE_ANON_KEY`

### 6. Configurar las variables de entorno

1. En la carpeta `RentApto`, crea un archivo llamado exactamente **`.env`** (con el punto al inicio).
   - En VS Code: **File → New File**, guarda como `.env` en la raíz del proyecto.
2. Pega este contenido y reemplaza con tus valores reales:
   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 7. Instalar dependencias y correr localmente

Abre PowerShell **dentro de la carpeta RentApto** y ejecuta:

```powershell
npm install
npm run dev
```

Abre tu navegador en **http://localhost:5173** — ya deberías ver la app.

---

## Desplegar en producción con Vercel

### 8. Crear un repositorio en GitHub

1. Ve a https://github.com y crea una cuenta si no tienes.
2. Haz clic en **"New repository"**, nómbralo `rentapto`, déjalo **Private**, y haz clic en **"Create repository"**.
3. En PowerShell, dentro de la carpeta `RentApto`:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/rentapto.git
   git push -u origin main
   ```
   (Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub)

### 9. Conectar con Vercel

1. Ve a https://vercel.com y crea una cuenta (puedes entrar con GitHub).
2. Haz clic en **"Add New Project"**.
3. Importa tu repositorio `rentapto` de GitHub.
4. En la sección **Environment Variables**, agrega estas tres variables:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anon de Supabase
   - `ANTHROPIC_API_KEY` → tu clave de API de Anthropic (obtenla en https://console.anthropic.com)
5. Haz clic en **"Deploy"**.
6. En ~1 minuto tendrás tu app en una URL tipo `https://rentapto.vercel.app`.

> **Nota:** `ANTHROPIC_API_KEY` NO lleva el prefijo `VITE_` porque es una variable de servidor
> (solo la lee el backend en `api/extract-apartment.js`, nunca el navegador).

### Para usar el importador IA en desarrollo local

Agrega `ANTHROPIC_API_KEY` a tu archivo `.env`:
```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```
Luego corre el dev server de Vercel en lugar de `npm run dev`:
```powershell
npm install -g vercel
vercel dev
```
Esto levanta tanto el frontend como las rutas de `/api` localmente.

---

## Estructura del proyecto

```
src/
  lib/
    supabase.js            # Cliente de Supabase
    calculations.js        # Todas las fórmulas financieras
  hooks/
    useAuth.js             # Hook de autenticación
  components/
    ui/
      YieldBadge.jsx       # Badge verde/amarillo/rojo
    form/
      SummaryPanel.jsx     # Panel de resumen en tiempo real
      MortgageCalculator.jsx
      IncomeCosts.jsx
      PropertyDetails.jsx
    apartments/
      ApartmentCard.jsx    # Tarjeta en la lista
      ApartmentDetail.jsx  # Vista detalle
  pages/
    Auth.jsx               # Login / Signup
    MyApartments.jsx       # Tab 1: lista y detalle
    AddEdit.jsx            # Tab 2: formulario
    Compare.jsx            # Tab 3: comparación
  App.jsx                  # Routing y layout
  main.jsx
schema.sql                 # Esquema de Supabase con RLS
```

## Fórmulas financieras

| Indicador | Formula |
|-----------|---------|
| Tasa nominal mensual | rm = (1 + TEA)^(1/12) - 1 |
| Cuota mensual | loan x (rm x (1+rm)^n) / ((1+rm)^n - 1) |
| Rentabilidad bruta | (arriendo x 12) / precio x 100 |
| Rentabilidad neta | ((arriendo - costos) x 12) / precio x 100 |
| Flujo neto mensual | arriendo - costos_totales |
| Cap Rate | (arriendo x 12) / total_inversion x 100 |
| Precio/m2 | precio / area |

## Thresholds de rentabilidad bruta

| Rentabilidad | Badge |
|---|---|
| >= 7% | Buena inversion (verde) |
| 5% - 7% | Moderada (amarillo) |
| < 5% | Revisar numeros (rojo) |
