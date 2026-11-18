// Хук разрешения модулей Node: направляет `cloudflare:workers` на заглушку.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return {
      url: new URL("./cloudflare-workers-stub.mjs", import.meta.url).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
