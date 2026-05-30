# 🗺️ Configuración de Google Maps

Para que los mapas funcionen en la aplicación, necesitas obtener una API Key de Google Maps.

## Pasos para obtener tu API Key:

### 1. Ve a Google Cloud Console
Visita: https://console.cloud.google.com/

### 2. Crea o selecciona un proyecto
- Si no tienes un proyecto, créalo
- Ponle un nombre como "Roomies Chile"

### 3. Habilita las APIs necesarias
Ve a **APIs & Services** > **Library** y habilita las siguientes APIs:

#### a) Maps JavaScript API
- Busca "Maps JavaScript API"
- Haz click en **Enable**

#### b) Places API
- Busca "Places API"
- Haz click en **Enable**

### 4. Crea credenciales (API Key)
- Ve a **APIs & Services** > **Credentials**
- Haz click en **Create Credentials** > **API Key**
- Se generará tu API Key

### 5. (Opcional pero recomendado) Restringe tu API Key
- Haz click en la API Key recién creada
- En "Application restrictions" selecciona "HTTP referrers"
- Agrega: `http://localhost:3000/*` (para desarrollo)
- En "API restrictions" selecciona "Restrict key"
- Selecciona:
  - ✅ Maps JavaScript API
  - ✅ Places API

### 6. Configura la variable de entorno
Edita el archivo `.env.local` en la carpeta `frontend`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

### 7. Reinicia el servidor de desarrollo
```bash
npm run dev
```

## 💰 Costos

Google Maps ofrece:
- **$200 USD de crédito gratis cada mes**
- Primeras **28,000 cargas de mapa = GRATIS** (con el crédito mensual)
- Autocompletado de Places: primeras 28,500 solicitudes = GRATIS
- Para desarrollo local no tendrás costos

## 📝 Notas

- **Nunca** compartas tu API Key públicamente
- En producción, configura restricciones estrictas
- Si no configuras la API Key, verás un mensaje indicándolo en lugar del mapa

## ✅ Verificación

Si todo está bien configurado, deberías ver:
- En crear/editar publicación: 
  - Un campo de dirección con autocompletado (al escribir, aparecen sugerencias)
  - Un mapa interactivo que se actualiza automáticamente al seleccionar una dirección
  - Posibilidad de ajustar la ubicación haciendo click en el mapa
- En el detalle de publicación: Un mapa de solo lectura mostrando la ubicación

## 🎯 Funcionalidades:

### Autocompletado de dirección:
1. Empieza a escribir una dirección en el campo
2. Aparecerán sugerencias de Google Places
3. Al seleccionar una sugerencia:
   - ✅ Se rellena la dirección completa
   - ✅ Se actualiza el campo "Comuna" automáticamente
   - ✅ El mapa se centra en esa ubicación
   - ✅ Aparece un marcador en el mapa

### Selección manual en el mapa:
- También puedes hacer click directamente en el mapa para ajustar la ubicación
- Útil para precisar la ubicación exacta después del autocompletado

¡Listo! 🎉
