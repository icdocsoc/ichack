export default function () {
  const config = useRuntimeConfig();

  return {
    resolveServerUrl(publicUrl: string): string {
      return import.meta.server ? config.serverBaseUrl : publicUrl;
    }
  };
}
