import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { ZodError } from 'zod'
import { parseAndCompute } from './lib/schema.js'

/**
 * Vercel Serverless Function — POST /api/save-apartment
 *
 * Body:  { data: ApartmentFormData, id?: string }
 * Auth:  Authorization: Bearer <supabase-access-token>
 *
 * - Validates the JWT to identify the user
 * - Parses + validates form data through Zod
 * - Computes quota server-side
 * - Inserts or updates in Supabase
 * - Returns the saved row or validation errors
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ── Env check ────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured.' })
  }

  // ── Auth: verify Supabase JWT ────────────────────────────────────────────
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' })
  }
  const token = authHeader.slice(7)

  // Use anon client just to verify the token
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!anonKey) {
    return res.status(500).json({ error: 'SUPABASE_ANON_KEY not configured.' })
  }

  const authClient = createClient(supabaseUrl, anonKey)
  const { data: { user }, error: authError } = await authClient.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  // ── Validate body ────────────────────────────────────────────────────────
  const { data: rawData, id } = req.body as { data?: unknown; id?: string }

  if (!rawData || typeof rawData !== 'object') {
    return res.status(400).json({ error: 'Missing "data" in request body.' })
  }

  let payload
  try {
    payload = parseAndCompute(rawData)
  } catch (err) {
    if (err instanceof ZodError) {
      // Return field-level errors
      const fieldErrors = err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(422).json({ error: 'Datos inválidos.', fieldErrors })
    }
    return res.status(400).json({ error: 'Error al procesar los datos.' })
  }

  // ── Save to Supabase ─────────────────────────────────────────────────────
  // Service role key bypasses RLS — we already validated auth above
  const db = createClient(supabaseUrl, serviceRoleKey)

  const row = { ...payload, user_id: user.id }

  const result = id
    ? await db.from('apartments').update(row).eq('id', id).eq('user_id', user.id).select().single()
    : await db.from('apartments').insert(row).select().single()

  if (result.error) {
    console.error('[save-apartment]', result.error)
    return res.status(500).json({ error: result.error.message })
  }

  return res.status(200).json(result.data)
}
