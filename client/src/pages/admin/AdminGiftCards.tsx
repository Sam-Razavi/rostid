import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';
import type { ApiResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface GiftCard {
  id: string;
  code: string;
  balanceOre: number;
  usedOre: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('sv-SE');
}

export default function AdminGiftCards() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [balanceSek, setBalanceSek] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['admin-gift-cards'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<GiftCard[]>>('/admin/gift-cards');
      return data.data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<ApiResponse<GiftCard>>('/admin/gift-cards', {
        balanceOre: Math.round(parseFloat(balanceSek) * 100),
        expiresAt: expiresAt || undefined,
      });
      return data.data;
    },
    onSuccess: (card) => {
      qc.invalidateQueries({ queryKey: ['admin-gift-cards'] });
      toast.success(`Gift card created: ${card.code}`);
      setShowForm(false);
      setBalanceSek('');
      setExpiresAt('');
    },
    onError: () => toast.error('Failed to create gift card'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-stone-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Gift Cards</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New gift card'}
        </Button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Create gift card</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Balance (kr)"
              type="number"
              min={1}
              value={balanceSek}
              onChange={(e) => setBalanceSek(e.target.value)}
              placeholder="e.g. 500"
            />
            <Input
              label="Expires at (optional)"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => create.mutate()}
              loading={create.isPending}
              disabled={!balanceSek}
            >
              Generate
            </Button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Code</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">Balance</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">Used</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">Remaining</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Expires</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-mono font-semibold text-stone-900">{card.code}</td>
                <td className="px-4 py-3 text-right text-stone-700">
                  {formatPrice(card.balanceOre)}
                </td>
                <td className="px-4 py-3 text-right text-stone-500">{formatPrice(card.usedOre)}</td>
                <td className="px-4 py-3 text-right font-medium text-stone-900">
                  {formatPrice(card.balanceOre - card.usedOre)}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {card.expiresAt ? formatDate(card.expiresAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      card.isActive && card.balanceOre > card.usedOre
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {!card.isActive
                      ? 'Inactive'
                      : card.balanceOre <= card.usedOre
                        ? 'Used up'
                        : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                  No gift cards yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
