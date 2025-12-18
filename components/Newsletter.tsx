import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Item } from '../types';
import { Mail, Send, CheckCircle2, Loader2, ImageIcon, Sparkles } from 'lucide-react';
import { DialogService } from '../services/dialogService';
import { formatCurrencySimple } from '../utils/currency';

const Newsletter: React.FC = () => {
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  // Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await apiService.getItems();
        // Simulate "New Stocks" by taking the last 4 items (assuming mock data order implies recency for now)
        // In a real app we would sort by created_at or lastUpdated
        const newest = data.slice(-4).reverse();
        setRecentItems(newest);
        setSubject(`Check out our new arrivals! ${newest[0]?.name} and more!`);
        setMessage(`Hey Hobbyists,\n\nWe've just updated our inventory with some exciting new items. Check out the ${newest[0]?.name} and other fresh stocks!\n\nVisit Upkeep Hobbies today.`);
      } catch (e) {
        console.error("Failed to load items for newsletter", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiService.sendNewsletter(subject, message, recentItems.map(i => i.id));
      setIsSent(true);
      // Reset after delay
      setTimeout(() => {
        setIsSent(false);
        setSubject('');
        setMessage('');
      }, 3000);
    } catch (e) {
      DialogService.error("Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 mt-2">Loading newsletter module...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-3">
          <Mail className="text-indigo-500" />
          Newsletter Campaign
        </h2>
        <p className="text-slate-400 text-sm mt-1">Notify subscribers about the latest inventory updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: New Arrivals Preview */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            New Arrivals Feature
          </h3>
          <div className="space-y-3">
            {recentItems.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex gap-3 group hover:border-indigo-500/50 transition-colors">
                <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-600">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-slate-200 font-medium text-sm truncate group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                  <p className="text-slate-500 text-xs mt-1">{item.category}</p>
                  <p className="text-emerald-400 text-xs font-mono mt-1">{formatCurrencySimple(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
             <p className="text-indigo-300 text-xs text-center">These items will be highlighted in the email.</p>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            {isSent && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">Sent Successfully!</h3>
                <p className="text-slate-400 mt-2">Your campaign has been queued for delivery.</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Campaign Subject</label>
              <input
                required
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                placeholder="Enter email subject"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Message Content</label>
              <textarea
                required
                rows={8}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Write your newsletter content here..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                Target Audience: <span className="text-slate-300 font-medium">All Subscribers (1,203)</span>
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Send Campaign
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;