// Only these existing inline blocks may run: the two Three.js import maps,
// and the embedded-view initializer in real-viewer/index.html.
const inlineScripts = [
  "'sha256-D6m7ksu5/ddKbhxBUB7Tz2XnPIfUB46k45UOj1KX7Oc='",
  "'sha256-6p13ug9Y/2TWPZMF0aIT0xv2TqxNkp62hhuZFDN2uAM='",
  "'sha256-kY/RoiPC025J96zRjO2qyjvCf92z04C79ke9qKZwikE='",
];

export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "frame-src 'self'",
    "form-action 'self'",
    "script-src 'self' " + inlineScripts.join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self' blob: data:",
  ].join('; '),
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
