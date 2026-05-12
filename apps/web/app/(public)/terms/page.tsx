export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="font-heading text-3xl font-bold text-tradealo-text">Términos y condiciones</h1>
      <p className="text-tradealo-text-muted text-sm">Última actualización: mayo 2026</p>
      <div className="space-y-4 text-sm text-tradealo-text leading-relaxed">
        <p>Al usar Tradealo aceptás estos términos. El servicio está destinado exclusivamente a usuarios en Argentina.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Uso del servicio</h2>
        <p>Tradealo es una plataforma de intermediación entre vendedores y compradores. No somos parte de ninguna transacción entre usuarios.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Publicaciones</h2>
        <p>Cada usuario es responsable del contenido que publica. Queda prohibido publicar artículos ilegales, falsificados o que infrinjan derechos de terceros.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Tokens</h2>
        <p>Los tokens son créditos internos de la plataforma. No tienen valor monetario fuera de Tradealo y no son reembolsables salvo error técnico comprobado.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Contacto</h2>
        <p>Consultas: <a href="mailto:hola@trocalia.com.ar" className="text-tradealo-primary hover:underline">hola@trocalia.com.ar</a></p>
      </div>
    </div>
  );
}
