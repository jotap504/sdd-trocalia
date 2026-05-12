export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="font-heading text-3xl font-bold text-tradealo-text">Centro de ayuda</h1>
      <p className="text-tradealo-text-muted text-sm">¿Tenés alguna duda? Acá encontrás las respuestas más frecuentes.</p>
      <div className="space-y-6">
        <div className="border border-tradealo-border rounded-xl p-5 space-y-2">
          <h2 className="font-heading font-semibold text-base">¿Cómo publico un artículo?</h2>
          <p className="text-sm text-tradealo-text-muted">Iniciá sesión, hacé clic en "Publicar un anuncio" y seguí los 6 pasos del formulario. ¡Es gratis para la primera publicación estándar!</p>
        </div>
        <div className="border border-tradealo-border rounded-xl p-5 space-y-2">
          <h2 className="font-heading font-semibold text-base">¿Para qué sirven los tokens?</h2>
          <p className="text-sm text-tradealo-text-muted">Los tokens son la moneda interna de Tradealo. Se usan para publicar anuncios premium y extender la duración de tus publicaciones.</p>
        </div>
        <div className="border border-tradealo-border rounded-xl p-5 space-y-2">
          <h2 className="font-heading font-semibold text-base">¿Cómo verifico mi identidad (KYC)?</h2>
          <p className="text-sm text-tradealo-text-muted">Ingresá a tu perfil y seleccioná "Verificar identidad". Necesitarás tu DNI y una selfie. La verificación aumenta la confianza en tus publicaciones.</p>
        </div>
        <div className="border border-tradealo-border rounded-xl p-5 space-y-2">
          <h2 className="font-heading font-semibold text-base">¿Cómo contacto a Tradealo?</h2>
          <p className="text-sm text-tradealo-text-muted">Escribinos a <a href="mailto:hola@trocalia.com.ar" className="text-tradealo-primary hover:underline">hola@trocalia.com.ar</a>. Respondemos en 24–48 horas hábiles.</p>
        </div>
      </div>
    </div>
  );
}
