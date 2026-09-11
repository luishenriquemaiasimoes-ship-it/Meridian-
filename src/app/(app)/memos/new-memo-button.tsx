'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, InlineNote, Input, Modal, Select, useToast } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MEMO_SECTIONS } from '@/lib/memo/sections';

export function NewMemoButton({ companies }: { companies: { ticker: string; name: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ticker, setTicker] = useState(companies[0]?.ticker ?? '');
  const [title, setTitle] = useState('');

  const create = async () => {
    setBusy(true);
    try {
      const company = companies.find((c) => c.ticker === ticker);
      const res = await fetch('/api/memos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          title: title.trim() || `${company?.name ?? ticker} — investment memo`,
          sections: MEMO_SECTIONS.map((s) => ({ key: s.key, title: s.title, body: '' })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Memo not created', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Memo created', description: 'Opening the editor.' });
      router.push(`/memos/${data.memo.id}`);
    } finally { setBusy(false); }
  };

  return (
    <>
      <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setOpen(true)}>New memo</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New investment memo"
        subtitle="Twelve sections, fixed in order, so two memos can be read side by side."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={create} loading={busy} disabled={!ticker}>Create and open</Button>
          </div>
        }
      >
        <div className="space-y-3 p-4">
          <Field label="Company" required>
            <Select value={ticker} onChange={(e) => setTicker(e.target.value)}>
              {companies.map((c) => <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>)}
            </Select>
          </Field>
          <Field label="Title" hint="Left blank, the company name is used.">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vale — increase to 11%" />
          </Field>
          <InlineNote tone="info">
            The editor shows the evidence pack beside each section: the thesis and its assumption checks, the valuation
            models and what they imply, the peer medians and the recorded catalysts and risks. Every figure is the one
            the rest of the workspace computes, so a reader can check it on the company screen.
          </InlineNote>
        </div>
      </Modal>
    </>
  );
}
