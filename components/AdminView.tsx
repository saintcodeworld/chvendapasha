
import React from 'react';
import { PayoutRecord } from '../types';

interface AdminViewProps {
  history: PayoutRecord[];
  onAction: (id: string, action: 'completed' | 'failed') => void;
}

const AdminView: React.FC<AdminViewProps> = ({ history, onAction }) => {
  const pending = history.filter(p => p.status === 'pending');

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden animate-in fade-in duration-500 text-white">
      <div className="p-6 border-b border-zinc-800 bg-zinc-950">
        <h3 className="text-xl font-bold">Admin Treasury Portal</h3>
        <p className="text-sm">Manage pending payout requests and broadcast to Solana.</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/30 border-b border-zinc-800">
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
          <p className="text-[10px] uppercase font-bold mb-1">Total Pending</p>
          <p className="text-2xl font-bold">{pending.length}</p>
        </div>
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
          <p className="text-[10px] uppercase font-bold mb-1">Treasury SOL</p>
          <p className="text-2xl font-bold text-purple-400">14.25 SOL</p>
        </div>
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
          <p className="text-[10px] uppercase font-bold mb-1">Volume 24h</p>
          <p className="text-2xl font-bold text-green-400">2.14 SOL</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-white">
            <tr>
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {pending.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white italic">No pending requests found.</td>
              </tr>
            ) : (
              pending.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-xs mono text-white">#{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white mono">{item.address}</span>
                      <span className="text-[10px] text-white">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-purple-400">{item.amountSOL.toFixed(4)} SOL</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onAction(item.id, 'completed')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold rounded uppercase transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onAction(item.id, 'failed')}
                        className="px-3 py-1 bg-zinc-800 hover:bg-red-600 text-white text-[10px] font-bold rounded uppercase transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminView;
