
import React from 'react';
import { Settings as SettingsIcon, Volume2, Bell, Cpu, Eye, Database } from 'lucide-react';
import { useSound } from './SoundContext';
import { useSettings } from './SettingsContext';

const Settings: React.FC = () => {
  const { playClick, playPop } = useSound();
  const { 
      soundEnabled, toggleSound, 
      notificationsEnabled, toggleNotifications, 
      godMode, toggleGodMode 
  } = useSettings();

  const handleGodModeToggle = () => {
      playPop();
      toggleGodMode();
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-slate-400" /> Settings
      </h1>

      <div className="space-y-6">
          {/* General Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferences</h3>
              </div>
              <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Volume2 className="w-5 h-5" /></div>
                          <div>
                              <div className="text-white font-medium">UI Sounds</div>
                              <div className="text-slate-500 text-sm">Play procedural audio effects</div>
                          </div>
                      </div>
                      <button onClick={() => { playClick(); toggleSound(); }} className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-cascade-600' : 'bg-slate-700'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Bell className="w-5 h-5" /></div>
                          <div>
                              <div className="text-white font-medium">Notifications</div>
                              <div className="text-slate-500 text-sm">Toast alerts for market activity</div>
                          </div>
                      </div>
                      <button onClick={() => { playClick(); toggleNotifications(); }} className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-cascade-600' : 'bg-slate-700'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>
              </div>
          </div>

          {/* Developer Section */}
          <div className={`border rounded-xl overflow-hidden transition-all duration-500 shadow-lg ${godMode ? 'bg-slate-900 border-cascade-500/50 shadow-[0_0_30px_rgba(20,184,166,0.1)]' : 'bg-slate-900 border-slate-800'}`}>
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${godMode ? 'text-cascade-400' : 'text-slate-500'}`}>Advanced</h3>
                  {godMode && <span className="text-[10px] bg-cascade-500/10 text-cascade-400 px-2 py-0.5 rounded border border-cascade-500/20 animate-pulse">GOD MODE ACTIVE</span>}
              </div>
              <div className="p-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${godMode ? 'bg-cascade-500/20 text-cascade-400' : 'bg-slate-800 text-slate-500'}`}><Cpu className="w-5 h-5" /></div>
                          <div>
                              <div className="text-white font-medium">God Mode</div>
                              <div className="text-slate-500 text-sm">Enable system HUD and raw data streams</div>
                          </div>
                      </div>
                      <button onClick={handleGodModeToggle} className={`w-12 h-6 rounded-full transition-colors relative ${godMode ? 'bg-cascade-500' : 'bg-slate-700'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${godMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>

                  {godMode && (
                      <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-400">
                              <div className="flex items-center gap-2 mb-2 text-cascade-400"><Database className="w-3 h-3"/> Mempool Status</div>
                              <div>Tx Pending: 0</div>
                              <div>Latency: 12ms</div>
                              <div>Nodes: 4/12 Active</div>
                          </div>
                           <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-400">
                              <div className="flex items-center gap-2 mb-2 text-cascade-400"><Eye className="w-3 h-3"/> Oracle Feed</div>
                              <div>Stream: Connected</div>
                              <div>Sources: 3</div>
                              <div>Verifiable: True</div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
          
           <div className="text-center text-xs text-slate-600 mt-8 font-mono">
              Cascade Protocol v2.1.0-alpha • Linera Network
          </div>
      </div>
    </div>
  );
};

export default Settings;
