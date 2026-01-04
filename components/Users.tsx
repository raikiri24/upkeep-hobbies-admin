import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import { DialogService } from "../services/dialogService";
import { Player, BeybladeStats } from "../types";
import { generateAvatarUrl } from "../utils/avatar";

// --- Sub-Component: StatCounter ---
// Extracts the logic for the +/- buttons to keep the main component clean
interface StatCounterProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
}

const StatCounter: React.FC<StatCounterProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 gap-2 sm:gap-0">
      <label className="text-sm font-medium text-slate-300 sm:w-1/3">{label}</label>
      <div className="flex items-center justify-center space-x-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))} // Prevent negative numbers
          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 font-bold transition-colors min-w-[40px] min-h-[40px] sm:min-w-[32px] sm:min-h-[32px]"
        >
          -
        </button>

        {/* Number Display/Input */}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-20 sm:w-16 text-center bg-slate-700 border border-slate-600 rounded-md p-2 sm:p-2 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base sm:text-sm"
        />

        {/* Increment Button */}
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 font-bold transition-colors min-w-[40px] min-h-[40px] sm:min-w-[32px] sm:min-h-[32px]"
        >
          +
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const Users: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<Partial<Player>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPlayers();
      setPlayers(data);
    } catch (err) {
      setError("Failed to fetch players.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    (player.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (player.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleSelectPlayer = (player: Player) => {
    if (!player || !player.id) {
      console.error("Invalid player selected:", player);
      return;
    }
    setSelectedPlayer(player);
    // Deep copy to ensure nested stats don't reference the original object directly during edits
    try {
      setFormData(JSON.parse(JSON.stringify(player)));
    } catch (error) {
      console.error("Error copying player data:", error);
      setFormData(player);
    }
    setSuccessMessage(null);
    setIsAddingNew(false);
  };

  const handleAddNewPlayer = () => {
    setSelectedPlayer(null);
    setFormData({
      name: '',
      email: '',
      avatar: generateAvatarUrl(''), // Generate with empty seed initially
      beybladeStats: {
        spinFinishes: 0,
        overFinishes: 0,
        burstFinishes: 0,
        extremeFinishes: 0,
      }
    });
    setSuccessMessage(null);
    setIsAddingNew(true);
  };

  // Handles standard text inputs (Name, Email, Avatar)
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate avatar when name changes for new players
    if (name === 'name' && isAddingNew) {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        avatar: value ? generateAvatarUrl(value) : generateAvatarUrl('')
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handles the specific update of a stat via the +/- buttons
  const handleStatUpdate = (
    statName: keyof BeybladeStats,
    newValue: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      beybladeStats: {
        ...(prev.beybladeStats as BeybladeStats),
        [statName]: newValue,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    // For updates, show confirmation dialog with only changed battle statistics
    if (!isAddingNew && formData.beybladeStats && selectedPlayer?.beybladeStats) {
      const newStats = formData.beybladeStats;
      const originalStats = selectedPlayer.beybladeStats;
      
      // Check which stats have changed
      const changedStats = [];
      
      if (newStats.spinFinishes !== originalStats.spinFinishes) {
        changedStats.push({
          name: 'Spin Finishes',
          old: originalStats.spinFinishes || 0,
          new: newStats.spinFinishes || 0
        });
      }
      
      if (newStats.overFinishes !== originalStats.overFinishes) {
        changedStats.push({
          name: 'Over Finishes',
          old: originalStats.overFinishes || 0,
          new: newStats.overFinishes || 0
        });
      }
      
      if (newStats.burstFinishes !== originalStats.burstFinishes) {
        changedStats.push({
          name: 'Burst Finishes',
          old: originalStats.burstFinishes || 0,
          new: newStats.burstFinishes || 0
        });
      }
      
      if (newStats.extremeFinishes !== originalStats.extremeFinishes) {
        changedStats.push({
          name: 'Extreme Finishes',
          old: originalStats.extremeFinishes || 0,
          new: newStats.extremeFinishes || 0
        });
      }

      // Only show dialog if battle statistics have changed
      if (changedStats.length > 0) {
        const statsList = changedStats.map(stat => 
          `<div><strong>${stat.name}:</strong> ${stat.old} → ${stat.new}</div>`
        ).join('');
        
        const confirmationMessage = `
          <div style="text-align: left; line-height: 1.6;">
            <p><strong>Battle Statistics Changes for:</strong><br>${formData.name}</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
              ${statsList}
            </div>
            <p><strong>Confirm these changes?</strong></p>
          </div>
        `.trim();

        const result = await DialogService.confirm(
          confirmationMessage,
          'Confirm Battle Statistics Changes',
          true
        );

        if (!result.isConfirmed) {
          return; // User cancelled the update
        }
      }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (isAddingNew) {
        // Create new player with avatar from form
        const newPlayer = await apiService.createPlayer(formData);
        console.log("Create successful:", newPlayer);
        setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
        setSelectedPlayer(newPlayer);
        setIsAddingNew(false);
        setSuccessMessage("Player created successfully!");
      } else {
        // Update existing player
        if (!selectedPlayer?.id) {
          setError("No player selected for update.");
          return;
        }

        console.log("Submitting update for player:", selectedPlayer.id);
        console.log("Form data:", formData);

        try {
          const updatedPlayer = await apiService.updatePlayer(
            selectedPlayer.id,
            formData
          );
          console.log("Update successful:", updatedPlayer);
          
          // Ensure the updated player has an ID by merging with original if needed
          const playerWithId = {
            ...updatedPlayer,
            id: updatedPlayer.id || selectedPlayer.id
          };
          
          console.log("Player with ID:", playerWithId);
          
          // Update the players list with the updated player
          setPlayers((prevPlayers) =>
            prevPlayers.map((p) =>
              p.id === selectedPlayer.id ? playerWithId : p
            )
          );
          setSelectedPlayer(playerWithId);
          setFormData(playerWithId);
          setSuccessMessage("Player updated successfully!");
          
          // Refetch players to ensure the list is up to date
          await fetchPlayers();
        } catch (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
      }
    } catch (err) {
      console.error("Operation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(isAddingNew ? `Failed to create player: ${errorMessage}` : `Failed to update player: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Players</h1>
          <p className="text-slate-400">Manage player profiles and battle statistics</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4 mb-6 text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4 mb-6 text-green-400">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Column: List */}
          <div className="w-full lg:w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 h-fit">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
               <h2 className="text-xl font-semibold text-white">Roster</h2>
               <div className="flex items-center gap-2">
                 <button
                   onClick={handleAddNewPlayer}
                   className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                 >
                   + Add New
                 </button>
                 {loading && (
                   <span className="text-xs text-slate-500 hidden sm:inline">Syncing...</span>
                 )}
               </div>
             </div>

             <div className="mb-4">
               <div className="relative">
                 <input
                   type="text"
                   placeholder="Search by name or email..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-sm"
                 />
                 <svg
                   className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                   />
                 </svg>
               </div>
             </div>

             <ul className="space-y-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
               {filteredPlayers.map((player) => (
                <li
                  key={player.id}
                  className={`cursor-pointer p-3 sm:p-4 rounded-lg transition-all ${
                    selectedPlayer?.id === player.id
                      ? "bg-indigo-600/20 border-indigo-500/50 border-l-4 shadow-sm"
                      : "hover:bg-slate-800 border border-slate-700"
                  }`}
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="font-medium text-white truncate">{player.name}</div>
                  <div className="text-sm text-slate-400 truncate">
                    {player.email}
                  </div>
                </li>
               ))}
               {filteredPlayers.length === 0 && searchQuery && (
                 <li className="text-center py-8 text-slate-500">
                   <svg
                     className="w-12 h-12 mx-auto mb-3 text-slate-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                     />
                   </svg>
                   <p className="text-sm">No players found matching "{searchQuery}"</p>
                 </li>
               )}
             </ul>
           </div>

          {/* Right Column: Edit Form */}
          <div className="w-full lg:w-2/3 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
            {selectedPlayer || isAddingNew ? (
              <div>
                <div className="border-b border-slate-800 pb-4 mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    {isAddingNew ? 'Add New Player' : 'Edit Profile'}
                  </h2>
                  {!isAddingNew && selectedPlayer && (
                    <p className="text-sm text-slate-500">
                      ID: {selectedPlayer.id}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Name
                      </label>
                       <input
                         type="text"
                         name="name"
                         value={formData.name || ""}
                         onChange={handleTextChange}
                         className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                       />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Email
                      </label>
                       <input
                         type="email"
                         name="email"
                         value={formData.email || ""}
                         onChange={handleTextChange}
                         className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                       />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label
                        htmlFor="avatar"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Avatar URL {isAddingNew && formData.name && <span className="text-xs text-slate-500">(Auto-generated from name)</span>}
                      </label>
                       <input
                         type="text"
                         name="avatar"
                         value={formData.avatar || ""}
                         onChange={handleTextChange}
                         placeholder="Avatar URL will be auto-generated from name"
                         className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                       />
                      {isAddingNew && formData.avatar && (
                        <div className="mt-2 flex items-center gap-3">
                          <img 
                            src={formData.avatar} 
                            alt="Avatar preview" 
                            className="w-12 h-12 rounded-full border-2 border-slate-600"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <span className="text-xs text-slate-500">Preview</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Section with Custom Counters */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4 border-b border-slate-800 pb-2">
                      Battle Statistics
                    </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <StatCounter
                        label="Spin Finishes"
                        value={formData.beybladeStats?.spinFinishes || 0}
                        onChange={(val) => handleStatUpdate("spinFinishes", val)}
                      />
                      <StatCounter
                        label="Over Finishes"
                        value={formData.beybladeStats?.overFinishes || 0}
                        onChange={(val) => handleStatUpdate("overFinishes", val)}
                      />
                      <StatCounter
                        label="Burst Finishes"
                        value={formData.beybladeStats?.burstFinishes || 0}
                        onChange={(val) => handleStatUpdate("burstFinishes", val)}
                      />
                      <StatCounter
                        label="Extreme Finishes"
                        value={formData.beybladeStats?.extremeFinishes || 0}
                        onChange={(val) =>
                          handleStatUpdate("extremeFinishes", val)
                        }
                      />
                    </div>
                  </div>

                   <div className="flex justify-center sm:justify-end pt-4">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 sm:py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors shadow-lg text-base sm:text-sm min-h-[44px]"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : (isAddingNew ? "Create Player" : "Save Changes")}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-lg">Select a player to edit details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;