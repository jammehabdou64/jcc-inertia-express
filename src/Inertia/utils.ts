export interface SsrResult {
  head?: string[];
  body?: string;
}

export const isValidSsrResult = (
  result: unknown,
): result is SsrResult & { body: string } => {
  return (
    typeof result === "object" &&
    result !== null &&
    typeof (result as SsrResult).body === "string" &&
    (result as SsrResult).body!.length > 0
  );
};

export const fetchSSR = async (url: string, params: object): Promise<SsrResult> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`SSR request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};
