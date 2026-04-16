import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un asistente especializado en extraer información de apartamentos en Colombia para un comparador de inversiones inmobiliarias en Cali.

Analiza el texto o imagen proporcionada (puede ser un aviso inmobiliario, descripción, foto de listing, captura de pantalla de Metrocuadrado, Finca Raíz, etc.) y extrae ÚNICAMENTE los campos que puedas identificar con certeza razonable.

Para campos que no puedas determinar con confianza, usa null. No inventes datos.

Los precios y valores monetarios deben ser números enteros en COP (pesos colombianos) sin puntos, comas ni símbolos. Ejemplo: si ves "$450.000.000" devuelve 450000000.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

Esquema exacto a devolver:
{
  "name": "nombre o referencia corta del apartamento si se menciona (string | null)",
  "neighborhood": "barrio o sector en Cali, Colombia (string | null)",
  "address": "dirección completa si se menciona (string | null)",
  "floor": "número de piso como entero (number | null)",
  "type": "uno de exactamente: Apartamento, Estudio, Penthouse, Dúplex (string | null)",
  "area": "área en metros cuadrados como número (number | null)",
  "bedrooms": "número de habitaciones (number | null)",
  "bathrooms": "número de baños (number | null)",
  "age": "antigüedad del edificio en años (number | null)",
  "parking": "número de parqueaderos incluidos (number | null)",
  "view": "uno de exactamente: Ciudad, Mar, Montaña, Parque, Interior, Otro — o null (string | null)",
  "sun_exposure": "uno de exactamente: Alta, Media, Baja — o null (string | null)",
  "amenities": "array con los que apliquen de esta lista: Piscina, Gimnasio, Sauna, BBQ, Rooftop, Portería 24h, Ascensor, Depósito, Pet friendly, Smart home. Usar [] si ninguno aplica (array)",
  "price": "precio de venta en COP como entero (number | null)",
  "rent": "canon de arriendo mensual en COP si se menciona (number | null)",
  "admin": "cuota de administración mensual en COP si se menciona (number | null)",
  "notes": "información adicional relevante no capturada en otros campos (string | null)"
}`

/**
 * Core extraction logic — swappable.
 *
 * Today: single messages.create() call.
 * Future: replace this function body with an agent flow that can:
 *   - Search Metrocuadrado/Finca Raíz for comparable prices
 *   - Validate neighborhood against Cali sectors
 *   - Cross-check yield against market averages
 *   - Flag suspicious asking prices
 *
 * The handler (extract-apartment.js) and the frontend never need to change.
 */
export async function extractApartmentData({ text, imageBase64, mediaType }) {
  // Build message content — supports text, image, or both
  const content = []

  if (imageBase64 && mediaType) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: imageBase64,
      },
    })
  }

  content.push({
    type: 'text',
    text: text?.trim() || 'Extrae la información del apartamento de la imagen.',
  })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  // Strip any accidental markdown fences
  const clean = raw.replace(/```json|```/g, '').trim()

  return JSON.parse(clean)
}
