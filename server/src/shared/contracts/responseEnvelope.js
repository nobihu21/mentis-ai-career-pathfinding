export function responseEnvelope(data, meta = {}, explainability = {}, confidence = null) {
  return {
    data,
    meta,
    explainability,
    confidence
  };
}
