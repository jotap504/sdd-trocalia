import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function EmailVerifiedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <Card className="w-full max-w-sm text-center">
        <CardBody className="p-10 space-y-5">
          <div className="flex justify-center">
            <CheckCircle
              size={72}
              className="text-trocalia-success"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-trocalia-text">
              ¡Email verificado!
            </h1>
            <p className="text-sm text-trocalia-text-muted mt-2">
              Tu email fue verificado con éxito. Ya podés ingresar a tu cuenta.
            </p>
          </div>
          <Link href="/login">
            <Button fullWidth size="lg">
              Ingresar ahora
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
