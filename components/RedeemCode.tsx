import React, { useState } from 'react';

interface RedeemCodeProps {
    userAddress: string;
    onRedeemSuccess: (amount: number) => void;
}

const RedeemCode: React.FC<RedeemCodeProps> = ({ userAddress, onRedeemSuccess }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRedeem = async () => {
        if (!code || code.length < 5) {
            setError('Please enter a valid code');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, userAddress }),
            });

            const data = await response.json();

            if (data.success) {
                onRedeemSuccess(data.amount);
                setSuccessMessage(`Success! redeemed ${data.amount} SOL`);
                setCode('');
            } else {
                setError(data.error || 'Redemption failed');
            }
        } catch (err) {
            setError('Network error. Check server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-100/10 rounded-2xl p-4 shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
            {/* Subtle Glow Overlay */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <h3 className="text-zinc-400 text-xs font-bold uppercase mb-3">Redeem Code</h3>

            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="PENGU-2026-XXXX-XXXX"
                    className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-black font-mono focus:border-cyan-500/50 outline-none w-full placeholder:text-zinc-400"
                    disabled={isLoading}
                />

                <button
                    onClick={handleRedeem}
                    disabled={isLoading}
                    className="neo-btn neo-btn-primary w-full py-2 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                        'Redeem'
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono text-center">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 font-mono text-center">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default RedeemCode;
