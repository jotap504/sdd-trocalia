export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="font-heading text-3xl font-bold text-tradealo-text">Política de privacidad</h1>
      <p className="text-tradealo-text-muted text-sm">Última actualización: mayo 2026</p>
      <div className="space-y-4 text-sm text-tradealo-text leading-relaxed">
        <p>Tu privacidad es importante para nosotros. Esta política describe cómo recopilamos y usamos tu información.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Datos que recopilamos</h2>
        <p>Recopilamos tu email, nombre de usuario y la información que ingresás en tus publicaciones. No vendemos ni compartimos tus datos personales con terceros.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Uso de los datos</h2>
        <p>Usamos tus datos para operar la plataforma, enviarte notificaciones relevantes y mejorar el servicio.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Cookies</h2>
        <p>Usamos cookies técnicas necesarias para el funcionamiento del sitio. No usamos cookies de seguimiento publicitario.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Contacto</h2>
        <p>Para ejercer tus derechos: <a href="mailto:hola@trocalia.com.ar" className="text-tradealo-primary hover:underline">hola@trocalia.com.ar</a></p>
      </div>
    </div>
  );
}
