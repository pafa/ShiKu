// No visitor identifier, referrer, full URL, coordinates or free-form message.
const events = new Set(['artwork','audio_played','landing','submitted','queued','admitted','ready','timeout','failed','cancelled']);
const devices = new Set(['touch','desktop']);
const entries = new Set(['hall','work','cave']);
const durations = [250,500,1000,2000,4000,8000,15000,30000,60000,120000,180000];
export function visitMetric(value) {
  if (!value || !events.has(value.event) || !devices.has(value.device) || !entries.has(value.entry)) return null;
  if (Object.keys(value).length !== 4 || !Number.isFinite(value.elapsedMs) || value.elapsedMs < 0) return null;
  const elapsedBucket = durations.find(limit => value.elapsedMs <= limit);
  return {event:value.event, device:value.device, entry:value.entry, elapsedBucket:elapsedBucket ?? 'over180s'};
}
