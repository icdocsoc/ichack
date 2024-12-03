export default defineEventHandler(event => {
  const headers = getHeaders(event);
  const hostname = headers['host'] ?? 'localhost:3000';
  const config = useRuntimeConfig();

  if (!config.public.mainDomain.includes(hostname)) {
    const subdomain = hostname?.match(/^[^.]*/g)?.[0];
    event.context.subdomain = subdomain;
  }
});
