import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Link, Clock } from 'lucide-react';
import { salespeopleApi } from '@/services/api';
import { toast } from 'sonner';

export default function AdminInvites() {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', maxUses: 1, expiresInDays: 7 });

  const fetchInvites = async () => {
    const data = await salespeopleApi.listInvites();
    setInvites(data);
  };

  useEffect(() => { fetchInvites(); }, []);

  const generateCode = () => 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase();

  const handleCreate = async () => {
    setLoading(true);
    try {
      await salespeopleApi.createInvite({
        code: form.code || generateCode(),
        maxUses: form.maxUses,
        expiresInDays: form.expiresInDays,
      });
      toast.success('Invite link created');
      setShowCreate(false);
      setForm({ code: '', maxUses: 1, expiresInDays: 7 });
      await fetchInvites();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/signup/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const revoke = async (id: string) => {
    await salespeopleApi.revokeInvite(id);
    toast.success('Invite revoked');
    await fetchInvites();
  };

  return (
    <div className="min-h-screen bg-[#0A1628] pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-heading-m text-white">SALESPERSON INVITES</h1>
            <p className="text-body-m text-[#64748B] mt-1">Generate private invite links for store staff</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={18} /> New Invite
          </button>
        </div>

        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-[#0F1D32] border border-white/10 rounded-2xl p-6">
            <h3 className="font-display text-label text-white mb-4">CREATE INVITE LINK</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#64748B]">Referral Code (optional)</label>
                <input className="input-field mt-1" placeholder="Auto-generated" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-xs text-[#64748B]">Max Uses</label>
                <input className="input-field mt-1" type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="text-xs text-[#64748B]">Expires In (days)</label>
                <input className="input-field mt-1" type="number" min={1} value={form.expiresInDays} onChange={(e) => setForm({ ...form, expiresInDays: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCreate} disabled={loading} className="btn-primary">Create</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="mt-6 space-y-3">
          {invites.length === 0 && <p className="text-[#64748B] text-center py-10">No invite links yet</p>}
          {invites.map((invite) => (
            <div key={invite.id} className="bg-[#0F1D32] border border-white/10 rounded-xl p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#E63946] font-bold">{invite.code}</span>
                  {invite.is_active ? (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                  ) : (
                    <span className="text-[10px] bg-[#E63946]/20 text-[#E63946] px-2 py-0.5 rounded-full uppercase tracking-wider">Revoked</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><Link size={12} /> {invite.used_count}/{invite.max_uses} used</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyLink(invite.token)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" title="Copy Link">
                  <Copy size={16} className="text-[#64748B]" />
                </button>
                {invite.is_active && (
                  <button onClick={() => revoke(invite.id)} className="p-2 bg-[#E63946]/10 rounded-lg hover:bg-[#E63946]/20 transition-colors" title="Revoke">
                    <Trash2 size={16} className="text-[#E63946]" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
