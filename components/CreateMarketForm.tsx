import React, { useState } from 'react';
import { Market, MarketCategory } from '../types';
import { Plus, Minus, Calendar, Network, Info, Tag, HelpCircle } from 'lucide-react';

interface CreateMarketFormProps {
  parentMarket?: Market;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative inline-flex ml-1.5 align-middle">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-cascade-400 cursor-help transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 hidden group-hover:block shadow-xl z-50 pointer-events-none">
            {text}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
        </div>
    </div>
);

const CreateMarketForm: React.FC<CreateMarketFormProps> = ({ parentMarket, onSubmit, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [outcomes, setOutcomes] = useState(['Yes', 'No']);
  const [expiryDays, setExpiryDays] = useState(30);
  const [liquidity, setLiquidity] = useState(100);
  const [category, setCategory] = useState<MarketCategory>('Other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: MarketCategory[] = ['Crypto', 'Economics', 'Politics', 'Tech', 'Sports', 'Other'];

  const addOutcome = () => {
    if (outcomes.length < 5) setOutcomes([...outcomes, '']);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        
        await onSubmit({
            question,
            outcomes: outcomes.filter(o => o.trim() !== ''),
            expiry: expiryDate.getTime(),
            initialLiquidity: liquidity,
            parentId: parentMarket?.id,
            category
        });
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700">
        <div className="w-10 h-10 bg-cascade-500/20 text-cascade-400 rounded-lg flex items-center justify-center">
            {parentMarket ? <Network className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
        <div>
            <h2 className="text-xl font-bold text-white">
                {parentMarket ? 'Spawn Sub-Market' : 'Create New Market'}
            </h2>
            {parentMarket && (
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                    Parent: <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-200">{parentMarket.question}</span>
                </p>
            )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
              Market Question
              <Tooltip text="Be precise. Ambiguous questions may be disputed by the oracle." />
          </label>
          <input
            type="text"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cascade-500 focus:border-cascade-500 placeholder:text-slate-600"
            placeholder="e.g., Will SpaceX land on Mars by 2030?"
          />
        </div>

        {/* Category */}
        <div className="space-y-3">
             <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                 <Tag className="w-4 h-4 text-slate-500" /> Category
                 <Tooltip text="Helps users find your market in the explorer." />
             </label>
             <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                     <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                            category === cat 
                            ? 'bg-cascade-500/20 border-cascade-500 text-cascade-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                     >
                         {cat}
                     </button>
                 ))}
             </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <label className="block text-sm font-medium text-slate-300">
                 Outcomes
                 <Tooltip text="Define all possible results. Must cover all scenarios." />
             </label>
             <button type="button" onClick={addOutcome} className="text-xs text-cascade-400 hover:text-cascade-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Outcome
             </button>
          </div>
          <div className="space-y-2">
            {outcomes.map((outcome, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={outcome}
                  onChange={(e) => updateOutcome(idx, e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-cascade-500"
                  placeholder={`Outcome ${idx + 1}`}
                />
                {outcomes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(idx)}
                    className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expiry */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" /> Duration (Days)
                    <Tooltip text="When betting closes and the market is ready for resolution." />
                </label>
                <input 
                    type="range" 
                    min="1" 
                    max="90" 
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cascade-500"
                />
                <div className="text-right text-xs text-cascade-400 font-mono">{expiryDays} days</div>
            </div>

            {/* Initial Liquidity */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                    Initial Liquidity ($)
                    <Tooltip text="Amount you must stake to bootstrap the market pool." />
                </label>
                <input
                    type="number"
                    min="10"
                    value={liquidity}
                    onChange={(e) => setLiquidity(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
            </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-cascade-600 hover:bg-cascade-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cascade-900/20"
            >
                {isSubmitting ? 'Creating...' : 'Create Market'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMarketForm;