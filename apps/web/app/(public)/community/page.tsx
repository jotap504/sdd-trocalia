export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="font-heading text-3xl font-bold text-tradealo-text">Reglas de la comunidad</h1>
      <p className="text-tradealo-text-muted text-sm">Última actualización: mayo 2026</p>
      <div className="space-y-4 text-sm text-tradealo-text leading-relaxed">
        <p>Tradealo es una comunidad de confianza. Para que funcione bien para todos, pedimos que respetes estas reglas.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Sé honesto</h2>
        <p>Describí tus productos con precisión. Las fotos deben ser del artículo real que estás ofreciendo.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Respetá a los demás</h2>
        <p>Tratá a cada usuario como te gustaría ser tratado. No se tolera el acoso, las amenazas ni el lenguaje ofensivo.</p>
        <h2 className="font-heading font-semibold text-base mt-6">No estafes</h2>
        <p>Las estafas o intentos de fraude resultan en la suspensión permanente de la cuenta y pueden derivar en acciones legales.</p>
        <h2 className="font-heading font-semibold text-base mt-6">Reportar problemas</h2>
        <p>Si ves algo que no está bien, escribinos a <a href="mailto:hola@trocalia.com.ar" className="text-tradealo-primary hover:underline">hola@trocalia.com.ar</a></p>
      </div>
    </div>
  );
}
