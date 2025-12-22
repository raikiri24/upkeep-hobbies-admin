import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
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
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
      <label className="text-sm font-medium text-slate-300 w-1/3">{label}</label>
      <div className="flex items-center space-x-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))} // Prevent negative numbers
          className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 font-bold transition-colors"
        >
          -
        </button>

        {/* Number Display/Input */}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-16 text-center bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />

        {/* Increment Button */}
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 font-bold transition-colors"
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

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    // Deep copy to ensure nested stats don't reference the original object directly during edits
    setFormData(JSON.parse(JSON.stringify(player)));
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
          console.log("No selected player ID");
          return;
        }

        console.log("Submitting update for player:", selectedPlayer.id);
        console.log("Form data:", formData);

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
        setSuccessMessage("Player updated successfully!");
        
        // Refetch players to ensure the list is up to date
        await fetchPlayers();
      }
    } catch (err) {
      console.error("Operation failed:", err);
      setError(isAddingNew ? "Failed to create player." : "Failed to update player.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Players</h1>
          <p className="text-slate-400">Manage player profiles and battle statistics</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-green-400">
            {successMessage}
          </div>
        )}

        <div className="flex gap-6">
          {/* Left Column: List */}
          <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Roster</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddNewPlayer}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  + Add New Player
                </button>
                {loading && (
                  <span className="text-xs text-slate-500">Syncing...</span>
                )}
              </div>
            </div>

            <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
              {players.map((player) => (
                <li
                  key={player.id}
                  className={`cursor-pointer p-4 rounded-lg transition-all ${
                    selectedPlayer?.id === player.id
                      ? "bg-indigo-600/20 border-indigo-500/50 border-l-4 shadow-sm"
                      : "hover:bg-slate-800 border border-slate-700"
                  }`}
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="font-medium text-white">{player.name}</div>
                  <div className="text-sm text-slate-400 truncate">
                    {player.email}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Edit Form */}
          <div className="w-2/3 bg-slate-900 border border-slate-800 rounded-xl p-6">
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors shadow-lg"
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