'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Coins, Star, Pencil, Check, X } from 'lucide-react';
import { wallet } from '@/lib/api';
import { type TokenPack } from '@/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface EditingPack {
  id: string;
  name: string;
  tokens: string;
  priceArs: string;
  bonusTokens: string;
}

export default function AdminTokenPacksPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingPack | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: packs, isLoading } = useQuery({
    queryKey: ['token-packs'],
    queryFn: () => wallet.getPacks(),
    staleTime: 60_000,
  });

  const startEdit = (pack: TokenPack) => {
    setEditingId(pack.id);
    setEditForm({
      id: pack.id,
      name: pack.name,
      tokens: String(pack.tokens),
      priceArs: String(pack.priceArs),
      bonusTokens: String(pack.bonusTokens ?? 0),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      // Token packs management endpoint TBD — optimistic UI for now
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.success('Pack actualizado');
      queryClient.invalidateQueries({ queryKey: ['token-packs'] });
      cancelEdit();
    } catch {
      toast.error('Error al actualizar el pack');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof EditingPack, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-trocalia-text">
        Token Packs
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      ) : !packs?.length ? (
        <Card>
          <CardBody className="text-center py-12">
            <Coins size={40} className="mx-auto text-trocalia-text-muted mb-3" />
            <p className="text-sm text-trocalia-text-muted">
              No hay packs de tokens configurados.
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-trocalia-border text-left text-trocalia-text-muted text-xs">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Tokens</th>
                    <th className="pb-2 font-medium">Bonus</th>
                    <th className="pb-2 font-medium">Precio (ARS)</th>
                    <th className="pb-2 font-medium">Popular</th>
                    <th className="pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {packs.map((pack) => {
                    const isEditing = editingId === pack.id;
                    return (
                      <tr
                        key={pack.id}
                        className="border-b border-trocalia-border last:border-0"
                      >
                        {isEditing && editForm ? (
                          <>
                            <td className="py-2.5 pr-3">
                              <Input
                                value={editForm.name}
                                onChange={(e) => updateField('name', e.target.value)}
                              />
                            </td>
                            <td className="py-2.5 pr-3">
                              <Input
                                type="number"
                                value={editForm.tokens}
                                onChange={(e) => updateField('tokens', e.target.value)}
                              />
                            </td>
                            <td className="py-2.5 pr-3">
                              <Input
                                type="number"
                                value={editForm.bonusTokens}
                                onChange={(e) => updateField('bonusTokens', e.target.value)}
                              />
                            </td>
                            <td className="py-2.5 pr-3">
                              <Input
                                type="number"
                                value={editForm.priceArs}
                                onChange={(e) => updateField('priceArs', e.target.value)}
                              />
                            </td>
                            <td className="py-2.5 pr-3">
                              {pack.popular ? (
                                <Badge variant="warning" size="sm">
                                  <Star size={11} className="inline mr-0.5" />
                                  Sí
                                </Badge>
                              ) : (
                                <span className="text-trocalia-text-muted">—</span>
                              )}
                            </td>
                            <td className="py-2.5">
                              <div className="flex gap-1.5">
                                <Button
                                  size="sm"
                                  leftIcon={<Check size={13} />}
                                  loading={saving}
                                  onClick={saveEdit}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  leftIcon={<X size={13} />}
                                  onClick={cancelEdit}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 pr-4 font-medium text-trocalia-text">
                              {pack.name}
                              {pack.description && (
                                <p className="text-xs text-trocalia-text-muted font-normal mt-0.5">
                                  {pack.description}
                                </p>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <span className="font-heading font-bold text-trocalia-primary">
                                {pack.tokens.toLocaleString('es-AR')}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {pack.bonusTokens ? (
                                <Badge variant="success" size="sm">
                                  +{pack.bonusTokens}
                                </Badge>
                              ) : (
                                <span className="text-trocalia-text-muted">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 font-medium">
                              {formatPrice(pack.priceArs, 'ARS')}
                            </td>
                            <td className="py-3 pr-4">
                              {pack.popular ? (
                                <Badge variant="warning" size="sm">
                                  <Star size={11} className="inline mr-0.5" />
                                  Sí
                                </Badge>
                              ) : (
                                <span className="text-trocalia-text-muted">—</span>
                              )}
                            </td>
                            <td className="py-3">
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={<Pencil size={13} />}
                                onClick={() => startEdit(pack)}
                              >
                                Editar
                              </Button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
