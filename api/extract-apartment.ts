import type { VercelRequest, VercelResponse } from '@vercel/node'
import { extractApartmentData } from './lib/extractor.js'

/**
 * Vercel Serverless Function — POST /api/extract-apartment
 *
 * This handler is intentionally thin: validate input, call the extractor,
 * return the result. All AI logic lives in api/lib/extractor.ts.
 *
 * Body (JSON):
 *   { text?: string, imageBase64?: string, mediaType?: string }
 *
 * Response (JSON):
 *   Apartment fields object (see extractor.ts for schema)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, imageBase64, mediaType } = req.body as {
    text?: string
    imageBase64?: string
    mediaType?: string
  }

  if (!text && !imageBase64) {
    return res.status(400).json({ error: 'Se requiere texto o imagen.' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en las variables de entorno de Vercel.' })
  }

  try {
    const extracted = await extractApartmentData({ text, imageBase64, mediaType })
    return res.status(200).json(extracted)
  } catch (err) {
    console.error('[extract-apartment]', err)
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Error al procesar la solicitud.' })
  }
}
