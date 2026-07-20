export const config = {
  runtime: 'edge',
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

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

    if (attachment instanceof File && attachment.size > 0) {
      if (attachment.size > MAX_FILE_SIZE) {
        return jsonResponse({ error: 'Файл слишком большой. Максимум 5 МБ.' }, 400)
      }

      if (attachment.type && !ALLOWED_TYPES.has(attachment.type)) {
        return jsonResponse({ error: 'Неподдерживаемый тип файла.' }, 400)
      }
    }

    // ponytail: edge has no durable disk; submissions are validated only until email/storage is wired up.
    return jsonResponse({ ok: true })
  } catch {
    return jsonResponse({ error: 'Не удалось обработать запрос.' }, 500)
  }
}
