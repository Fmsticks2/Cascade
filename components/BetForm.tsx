import React, { useState } from 'react';
import { Market, User } from '../types';
import { Calculator, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface BetFormProps {
  market: Market;
  user: User | null;
  onPlaceBet: (outcomeId: string, amount: number) => Promise<void>;
}

const BetForm: React.FC<BetFormProps> = ({ market, user, onPlaceBet }) => {
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>(market.outcomes[0].id);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedOutcome = market.outcomes.find(o => o.id === selectedOutcomeId);
  const numericAmount = parseFloat(amount) || 0;
  
  // Potential Payout Calculation (Simplified Fixed Odds for Demo)
  const odds = selectedOutcome ? selectedOutcome.odds : 50;
  const multiplier = 100 / odds;
  const potentialReturn = numericAmount * multiplier;
  const potentialProfit = potentialReturn - numericAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (numericAmount <= 0) {
        setError("Enter a valid amount");
        return;
    }
    if (numericAmount > user.balance) {
        setError("Insufficient balance");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
        await onPlaceBet(selectedOutcomeId, numericAmount);
        setSuccess(true);
        setAmount('');
        setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
        setError(err.message || "Failed to place bet");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!user) {
      return (
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
              <p className="text-slate-400 mb-2">Connect wallet to trade</p>
          </div>
      );
  }

  if (success) {
      return (
          <div className="bg-green-500/10 p-8 rounded-xl border border-green-500/30 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Bet Placed!</h3>
              <p className="text-slate-300 text-sm">You have successfully staked on {selectedOutcome?.name}.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-sm text-green-400 hover:text-green-300 font-medium"
              >
                  Place another bet
              </button>
          </div>
      );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-cascade-400" />
          <h2 className="text-lg font-semibold text-white">Place a Bet</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Outcome Selection */}
        <div className="space-y-3">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select Outcome</label>
            <div className="grid grid-cols-2 gap-3">
                {market.outcomes.map((outcome) => (
                    <div 
                        key={outcome.id}
                        onClick={() => setSelectedOutcomeId(outcome.id)}
                        className={`
                            relative cursor-pointer p-4 rounded-lg border transition-all
                            ${selectedOutcomeId === outcome.id 
                                ? 'bg-cascade-500/10 border-cascade-500 shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                                : 'bg-slate-900 border-slate-700 hover:border-slate-600'}
                        `}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-semibold ${selectedOutcomeId === outcome.id ? 'text-cascade-300' : 'text-slate-300'}`}>
                                {outcome.name}
                            </span>
                            {selectedOutcomeId === outcome.id && (
                                <div className="w-4 h-4 bg-cascade-500 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-2xl font-bold text-white">{outcome.odds}%</span>
                             <span className="text-xs text-slate-500">prob</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
            <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Stake Amount</label>
                <span className="text-xs text-slate-500">Max: ${user.balance.toFixed(2)}</span>
            </div>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-cascade-500 focus:ring-1 focus:ring-cascade-500 transition-all placeholder:text-slate-600"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                />
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2">
                {[10, 50, 100, 'Max'].map((val) => (
                    <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val === 'Max' ? user.balance.toString() : val.toString())}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 rounded transition-colors"
                    >
                        {val === 'Max' ? 'Max' : `$${val}`}
                    </button>
                ))}
            </div>
        </div>

        {/* Payout Summary */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Payout</span>
                <span className="text-white font-mono">${potentialReturn.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-400">Est. Profit</span>
                <span className="text-green-400 font-mono font-medium">+{potentialProfit.toFixed(2)}</span>
            </div>
        </div>

        {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <button
            type="submit"
            disabled={isSubmitting || numericAmount <= 0}
            className="w-full bg-gradient-to-r from-cascade-600 to-teal-700 hover:from-cascade-500 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-cascade-900/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
            {isSubmitting ? (
                 <span className="animate-pulse">Processing...</span>
            ) : (
                <>Place Bet <ArrowRight className="w-4 h-4" /></>
            )}
        </button>
      </form>
    </div>
  );
};

export default BetForm;