// Заглушка модуля `cloudflare:workers` для тестов в Node.
// Собранный Worker (vinext 1.x) импортирует этот модуль, но использует из него
// только необязательное поле `tracing`; полноценный рантайм есть лишь в Cloudflare.
export const env = {};
const stub = { env };
export default stub;
