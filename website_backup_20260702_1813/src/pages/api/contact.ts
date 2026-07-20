import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { APIRoute } from 'astro'

export const prerender = false

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const uploadsDir = join(process.cwd(), '.data', 'contact-uploads')

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData()
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const attachment = formData.get('attachment')

    if (name.length < 2) {
      return jsonResponse({ error: 'Укажите имя.' }, 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Укажите корректный email.' }, 400)
    }

    if (message.length < 10) {
      return jsonResponse({ error: 'Сообщение слишком короткое.' }, 400)
    }

    await mkdir(uploadsDir, { recursive: true })

    let savedFile: string | null = null

    if (attachment instanceof File && attachment.size > 0) {
      if (attachment.size > MAX_FILE_SIZE) {
        return jsonResponse({ error: 'Файл слишком большой. Максимум 5 МБ.' }, 400)
      }

      if (attachment.type && !ALLOWED_TYPES.has(attachment.type)) {
        return jsonResponse({ error: 'Неподдерживаемый тип файла.' }, 400)
      }

      const safeName = sanitizeFileName(attachment.name || 'attachment')
      const fileName = `${Date.now()}-${safeName}`
      const filePath = join(uploadsDir, fileName)
      const buffer = Buffer.from(await attachment.arrayBuffer())
      await writeFile(filePath, buffer)
      savedFile = fileName
    }

    const submissionPath = join(uploadsDir, `${Date.now()}-${sanitizeFileName(email)}.json`)
    await writeFile(
      submissionPath,
      JSON.stringify(
        {
          name,
          email,
          message,
          attachment: savedFile,
          receivedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      'utf8',
    )

    return jsonResponse({ ok: true })
  } catch {
    return jsonResponse({ error: 'Не удалось обработать запрос.' }, 500)
  }
}
