import React, { useEffect, useState } from "react";
import { apiService, useDeleteTournament } from "../hooks";
import { Tournament, TournamentFormData, Player } from "../types";
import { generateAvatarUrl } from "../utils/avatar";

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const deleteTournamentMutation = useDeleteTournament();
  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    date: new Date(),
    game: "Beyblade X",
    season: 1,
    status: "Scheduled",
    participants: [],
    maxPlayers: 20,
    standings: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);
  const [participantSearch, setParticipantSearch] = useState<string>("");
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: "",
    email: "",
    avatar: generateAvatarUrl(''), // Generate with empty seed initially
    beybladeStats: {
      spinFinishes: 0,
      overFinishes: 0,
      burstFinishes: 0,
      extremeFinishes: 0,
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tournamentsData, playersData] = await Promise.all([
        apiService.getTournaments(),
        apiService.getPlayers()
      ]);
      setTournaments(tournamentsData);
      setPlayers(playersData);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTournament = (tournament: Tournament) => {
    try {
      console.log('Selecting tournament:', tournament);
      
      // Validate tournament data before setting form
      if (!tournament || !tournament.name) {
        console.error('Invalid tournament data:', tournament);
        setError('Invalid tournament data');
        return;
      }

      // Handle date conversion safely
      let tournamentDate = tournament.date;
      if (typeof tournament.date === 'string') {
        const parsedDate = new Date(tournament.date);
        if (isNaN(parsedDate.getTime())) {
          console.warn('Invalid date format, using current date:', tournament.date);
          tournamentDate = new Date();
        } else {
          tournamentDate = parsedDate;
        }
      } else if (!(tournament.date instanceof Date)) {
        console.warn('Date is not a Date object, using current date:', tournament.date);
        tournamentDate = new Date();
      }

      setSelectedTournament(tournament);
      setFormData({
        name: tournament.name || '',
        date: tournamentDate,
        game: tournament.game || 'Beyblade X',
        season: tournament.season || 1,
        status: tournament.status || 'Scheduled',
        participants: Array.isArray(tournament.participants) ? tournament.participants : [],
        maxPlayers: tournament.maxPlayers || 20,
        standings: Array.isArray(tournament.standings) ? tournament.standings : []
      });
      setSuccessMessage(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error selecting tournament:', error);
      setError('Failed to select tournament. Please try again.');
    }
  };

  const handleAddNewTournament = () => {
    setSelectedTournament(null);
    setFormData({
      name: "",
      date: new Date(),
      game: "Beyblade X",
      season: 1,
      status: "Scheduled",
      participants: [],
      maxPlayers: 20,
      standings: []
    });
    setSuccessMessage(null);
    setIsAddingNew(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'date' ? new Date(value) : 
              name === 'season' || name === 'maxPlayers' ? parseInt(value, 10) : 
              value
    }));
  };

  const handleNewPlayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate avatar when name changes
    if (name === 'name') {
      setNewPlayer((prev) => ({ 
        ...prev, 
        [name]: value,
        avatar: value ? generateAvatarUrl(value) : generateAvatarUrl('')
      }));
    } else {
      setNewPlayer((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleParticipantToggle = (playerId: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(playerId)
        ? prev.participants.filter(id => id !== playerId)
        : [...prev.participants, playerId]
    }));
  };

  const handleStandingChange = (userId: string, field: 'rank' | 'score' | 'notes', value: string | number) => {
    // Prevent manual rank changes - rankings are calculated automatically
    if (field === 'rank') return;
    
    setFormData((prev) => {
      const updatedStandings = prev.standings?.map(standing => 
        standing.userId === userId 
          ? { ...standing, [field]: value }
          : standing
      ) || [];
      
      // Automatically recalculate rankings when scores change, but preserve order
      if (field === 'score') {
        return { ...prev, standings: calculateRanksOnly(updatedStandings) };
      }
      
      return { ...prev, standings: updatedStandings };
    });
  };

  const handleScoreChange = (userId: string, wins: number, losses: number) => {
    const score = `${wins}-${losses}`;
    handleStandingChange(userId, 'score', score);
  };

  const calculateRankings = (standings: any[]) => {
    // Sort by wins first, then by fewer losses
    if (!Array.isArray(standings)) return [];
    
    return standings
      .map(standing => {
        if (!standing) return null;
        const [wins, losses] = (standing.score || '0-0').split('-').map(Number);
        return {
          ...standing,
          wins: wins || 0,
          losses: losses || 0,
          winRate: wins + losses > 0 ? wins / (wins + losses) : 0,
          totalGames: wins + losses
        };
      })
      .filter(standing => standing !== null)
      .sort((a, b) => {
        // Primary: by wins (descending)
        if (b.wins !== a.wins) return b.wins - a.wins;
        // Secondary: by win rate (descending)  
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        // Tertiary: by fewer losses (ascending)
        if (a.losses !== b.losses) return a.losses - b.losses;
        return 0;
      })
      .map((standing, index) => ({
        ...standing,
        rank: index + 1,
        score: `${standing.wins}-${standing.losses}`
      }));
  };

  // New function that calculates ranks without reordering the standings
  const calculateRanksOnly = (standings: any[]) => {
    if (!Array.isArray(standings)) return standings;
    
    // Create a copy and calculate stats for each standing
    const standingsWithStats = standings.map((standing) => {
      const [wins, losses] = (standing.score || '0-0').split('-').map(Number);
      return {
        ...standing,
        wins: wins || 0,
        losses: losses || 0,
        winRate: wins + losses > 0 ? wins / (wins + losses) : 0,
        totalGames: wins + losses
      };
    });

    // Sort by performance criteria to determine rankings
    const sortedByPerformance = [...standingsWithStats].sort((a, b) => {
      // Primary: by wins (descending)
      if (b.wins !== a.wins) return b.wins - a.wins;
      // Secondary: by win rate (descending)  
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      // Tertiary: by fewer losses (ascending)
      if (a.losses !== b.losses) return a.losses - b.losses;
      return 0;
    });

    // Create rank mapping: userId -> rank
    const rankMap = {};
    sortedByPerformance.forEach((standing, index) => {
      rankMap[standing.userId] = index + 1;
    });

    // Apply ranks to standings in original order
    const result = standings.map(standing => ({
      ...standing,
      rank: rankMap[standing.userId] || 1
    }));

    return result;
  };

  const addMatchResult = (winnerId: string, loserId: string) => {
    setFormData((prev) => {
      const updatedStandings = [...(prev.standings || [])];
      
      const winnerStanding = updatedStandings.find(s => s.userId === winnerId);
      const loserStanding = updatedStandings.find(s => s.userId === loserId);
      
      if (winnerStanding && loserStanding) {
        // Handle win/loss (no more draws)
        const [wWins, wLosses] = (winnerStanding.score || '0-0').split('-').map(Number);
        const [lWins, lLosses] = (loserStanding.score || '0-0').split('-').map(Number);
        
        winnerStanding.score = `${wWins + 1}-${wLosses}`;
        loserStanding.score = `${lWins}-${lLosses + 1}`;
      }
      
      // Automatically re-rank all players based on new scores, but preserve order
      const rankedStandings = calculateRanksOnly(updatedStandings);
      
      return { ...prev, standings: rankedStandings };
    });
  };

  const addStanding = (userId: string) => {
    const existingStanding = formData.standings?.find(s => s.userId === userId);
    if (!existingStanding) {
      const player = players.find(p => p.id === userId);
      if (player) {
        setFormData((prev) => ({
          ...prev,
          standings: [...(prev.standings || []), {
            userId,
            rank: (prev.standings?.length || 0) + 1,
            score: "0-0",
            notes: ""
          }]
        }));
      }
    }
  };

  const removeStanding = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      standings: prev.standings?.filter(s => s.userId !== userId) || []
    }));
  };

  const generateStandingsFromParticipants = () => {
    // First, get all existing standings for participants
    const existingStandings = formData.standings?.filter(s => formData.participants.includes(s.userId)) || [];
    
    // Add new participants that don't have standings yet
    const newStandings = [...existingStandings];
    formData.participants.forEach(userId => {
      if (!existingStandings.find(s => s.userId === userId)) {
        newStandings.push({
          userId,
          rank: newStandings.length + 1,
          score: "0-0",
          notes: ""
        });
      }
    });
    
    // Calculate ranks but preserve existing order
    const rankedStandings = calculateRanksOnly(newStandings);
    setFormData((prev) => ({ ...prev, standings: rankedStandings }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.game) {
      setError("Name and game are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Calculate final rankings before saving, but preserve manual order
      const rankedStandings = formData.standings ? calculateRanksOnly(formData.standings) : [];
      const tournamentData = {
        ...formData,
        standings: rankedStandings
      };
      
      console.log("Saving tournament with ranked standings:", tournamentData);
      
      if (isAddingNew) {
        const newTournament = await apiService.createTournament(tournamentData);
        setTournaments((prev) => [...prev, newTournament]);
        setSelectedTournament(newTournament);
        setIsAddingNew(false);
        setSuccessMessage("Tournament created successfully!");
      } else {
        if (!selectedTournament?._id) return;
        
        const updatedTournament = await apiService.updateTournament(
          selectedTournament._id,
          tournamentData
        );
        
        setTournaments((prev) =>
          prev.map((t) =>
            t._id === selectedTournament._id ? updatedTournament : t
          )
        );
        setSelectedTournament(updatedTournament);
        setSuccessMessage("Tournament updated successfully!");
      }
    } catch (err) {
      console.error("Operation failed:", err);
      setError(isAddingNew ? "Failed to create tournament." : "Failed to update tournament.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTournament?._id) return;
    
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    
    setLoading(true);
    try {
      await deleteTournamentMutation.mutateAsync(selectedTournament._id);
      setTournaments((prev) => prev.filter((t) => t._id !== selectedTournament._id));
      setSelectedTournament(null);
      setSuccessMessage("Tournament deleted successfully!");
    } catch (err) {
      setError("Failed to delete tournament.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.email) {
      setError("Player name and email are required.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create player with avatar from form
      console.log("Creating player with data:", newPlayer);
      const createdPlayer = await apiService.createPlayer(newPlayer);
      console.log("Created player response:", createdPlayer);
      
      // Try to refetch players list first
      try {
        const updatedPlayers = await apiService.getPlayers();
        console.log("Refetched players list:", updatedPlayers);
        setPlayers(updatedPlayers);
      } catch (fetchErr) {
        console.log("Failed to refetch players, using created player:", fetchErr);
        // Fallback: add the created player to local state
        setPlayers((prev) => {
          const updated = [...prev, createdPlayer];
          console.log("Updated players list locally:", updated);
          return updated;
        });
      }
      
      // Reset form
      setNewPlayer({
        name: "",
        email: "",
        avatar: generateAvatarUrl(''),
        beybladeStats: {
          spinFinishes: 0,
          overFinishes: 0,
          burstFinishes: 0,
          extremeFinishes: 0,
        }
      });
      setShowAddPlayer(false);
      setSuccessMessage("Player added successfully!");
    } catch (err) {
      setError("Failed to add player.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Scheduled': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-700 text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Tournaments</h1>
          <p className="text-slate-400">Organize and manage tournaments and player standings</p>
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
              <h2 className="text-xl font-semibold text-white">Tournaments</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddNewTournament}
                  className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  + Add New
                </button>
                {loading && (
                  <span className="text-xs text-slate-500 hidden sm:inline">Syncing...</span>
                )}
              </div>
            </div>

            <ul className="space-y-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
              {tournaments.map((tournament) => (
                <li
                  key={tournament._id}
                  className={`cursor-pointer p-3 sm:p-4 rounded-lg transition-all ${
                    selectedTournament?._id === tournament._id
                      ? "bg-indigo-600/20 border-indigo-500/50 border-l-4 shadow-sm"
                      : "hover:bg-slate-800 border border-slate-700"
                  }`}
                  onClick={() => handleSelectTournament(tournament)}
                >
                  <div className="font-medium text-white truncate">{tournament.name}</div>
                  <div className="text-sm text-slate-400 truncate">
                    {tournament.game} - Season {tournament.season}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1 sm:gap-0">
                    <span className="text-xs text-slate-500">
                      {new Date(tournament.date).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(tournament.status)} inline-block text-center`}>
                      {tournament.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Edit Form */}
          <div className="w-full lg:w-2/3 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
            {selectedTournament || isAddingNew ? (
              <div>
                <div className="border-b border-slate-800 pb-4 mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    {isAddingNew ? 'Add New Tournament' : 'Edit Tournament'}
                  </h2>
                  {!isAddingNew && selectedTournament && (
                    <p className="text-sm text-slate-500">
                      ID: {selectedTournament._id}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Tournament Name
                      </label>
                       <input
                         type="text"
                         name="name"
                         value={formData.name}
                         onChange={handleInputChange}
                         className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                         required
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Game
                      </label>
                      <select
                        name="game"
                        value={formData.game}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                      >
                        <option value="Beyblade X">Beyblade X</option>
                        <option value="Beyblade Burst">Beyblade Burst</option>
                        <option value="Beyblade Metal Saga">Beyblade Metal Saga</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Date
                      </label>
                      <input
                        type="datetime-local"
                        name="date"
                        value={formData.date.toISOString().slice(0, 16)}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Season
                      </label>
                      <input
                        type="number"
                        name="season"
                        value={formData.season}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Max Players
                      </label>
                      <input
                        type="number"
                        name="maxPlayers"
                        value={formData.maxPlayers}
                        onChange={handleInputChange}
                        min="2"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors text-base sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                      <h3 className="text-lg font-medium text-white">
                        Participants ({formData.participants.length}/{formData.maxPlayers})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddPlayer(!showAddPlayer)}
                        className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px]"
                      >
                        + Quick Add
                      </button>
                    </div>
                    
                    {/* Quick Add Player Form */}
                    {showAddPlayer && (
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-white mb-4">Add New Player</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                             <input
                               type="text"
                               value={newPlayer.name || ""}
                               onChange={handleNewPlayerChange}
                               name="name"
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 sm:p-2 text-white text-base sm:text-sm placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                               placeholder="Player name"
                             />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                             <input
                               type="email"
                               value={newPlayer.email || ""}
                               onChange={handleNewPlayerChange}
                               name="email"
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 sm:p-2 text-white text-base sm:text-sm placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                               placeholder="player@email.com"
                             />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Avatar URL {newPlayer.name && <span className="text-xs text-slate-500">(Auto-generated from name)</span>}
                            </label>
                             <input
                               type="text"
                               value={newPlayer.avatar || ""}
                               onChange={handleNewPlayerChange}
                               name="avatar"
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 sm:p-2 text-white text-base sm:text-sm placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                               placeholder="Avatar URL will be auto-generated from name"
                             />
                            {newPlayer.avatar && (
                              <div className="mt-2 flex items-center gap-3">
                                <img 
                                  src={newPlayer.avatar} 
                                  alt="Avatar preview" 
                                  className="w-12 h-12 rounded-full border-2 border-slate-600"
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <span className="text-xs text-slate-500">Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddPlayer(false);
                              setNewPlayer({
                                name: "",
                                email: "",
                                avatar: generateAvatarUrl(''),
                                beybladeStats: {
                                  spinFinishes: 0,
                                  overFinishes: 0,
                                  burstFinishes: 0,
                                  extremeFinishes: 0,
                                }
                              });
                            }}
                             className="px-4 py-2 sm:py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors min-h-[44px]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddPlayer}
                            disabled={loading || !newPlayer.name || !newPlayer.email}
                             className="px-4 py-2 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                          >
                            Add Player
                          </button>
                        </div>
                      </div>
)}

                    {/* Search Bar */}
                    <div className="mb-3">
                      <div className="flex gap-2 items-center mb-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={participantSearch}
                            onChange={(e) => setParticipantSearch(e.target.value)}
                            placeholder="Search participants..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 sm:p-2 pr-10 text-white text-base sm:text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                          />
                          {participantSearch && (
                            <button
                              type="button"
                              onClick={() => setParticipantSearch("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {players.filter(player => 
                            player.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                            player.email.toLowerCase().includes(participantSearch.toLowerCase())
                          ).length} / {players.length} players
                        </div>
                      </div>
                    </div>

                    {/* Filtered Participants */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-slate-700 rounded-lg p-3 bg-slate-800/50">
                      {players
                        .filter(player => 
                          player.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                          player.email.toLowerCase().includes(participantSearch.toLowerCase())
                        )
                        .map((player) => (
                        <label
                          key={player.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.participants.includes(player.id)}
                            onChange={() => handleParticipantToggle(player.id)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                          />
                          <span className="text-sm text-slate-300 truncate">{player.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Match Logging */}
                  {formData.standings && formData.standings.length > 1 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-4 border-b border-slate-800 pb-2">
                        Log Match Results
                      </h3>
                       <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                           <div>
                             <label className="block text-sm font-medium text-slate-300 mb-2">Winner</label>
                             <select
                               id="winner-select"
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 sm:p-2 text-white text-base sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                             >
                               <option value="">Select winner</option>
                               {formData.standings?.map((standing) => {
                                 const player = players?.find(p => p.id === standing.userId);
                                 return (
                                   <option key={standing.userId} value={standing.userId}>
                                     {player?.name || 'Unknown Player'}
                                   </option>
                                 );
                               }) || []}
                             </select>
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-slate-300 mb-2">Loser</label>
                             <select
                               id="loser-select"
                               className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 sm:p-2 text-white text-base sm:text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                             >
                               <option value="">Select loser</option>
                               {formData.standings?.map((standing) => {
                                 const player = players?.find(p => p.id === standing.userId);
                                 return (
                                   <option key={standing.userId} value={standing.userId}>
                                     {player?.name || 'Unknown Player'}
                                   </option>
                                 );
                               }) || []}
                             </select>
                           </div>
                           <div className="flex items-end gap-2">
                             <button
                               type="button"
                               onClick={() => {
                                 try {
                                   const winnerSelect = document.getElementById('winner-select') as HTMLSelectElement;
                                   const loserSelect = document.getElementById('loser-select') as HTMLSelectElement;
                                   
                                   if (!winnerSelect || !loserSelect) {
                                     console.error('Select elements not found');
                                     return;
                                   }
                                   
                                   if (winnerSelect.value && loserSelect.value && winnerSelect.value !== loserSelect.value) {
                                     addMatchResult(winnerSelect.value, loserSelect.value);
                                     winnerSelect.value = '';
                                     loserSelect.value = '';
                                   }
                                 } catch (error) {
                                   console.error('Error logging match:', error);
                                   setError('Failed to log match result');
                                 }
                               }}
                               className="w-full sm:w-auto px-4 py-2 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors min-h-[44px]"
                             >
                               Log Match
                             </button>
                           </div>
                         </div>
                       </div>
                    </div>
                  )}

                  {/* Standings */}
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                      <h3 className="text-lg font-medium text-white">
                        Tournament Standings ({formData.standings?.length || 0})
                      </h3>
                      <div className="flex gap-2">
                         <button
                           type="button"
                           onClick={generateStandingsFromParticipants}
                           className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed min-h-[44px]"
                           disabled={formData.participants.length === 0}
                         >
                           Generate
                         </button>
                      </div>
                    </div>
                    
                    {formData.standings && formData.standings.length > 0 ? (
                      /* Mobile view: Card layout */
                      <div className="block lg:hidden space-y-3">
                        {formData.standings
                          ?.map((standing) => {
                            const player = players?.find(p => p.id === standing.userId);
                            const [wins, losses] = (standing.score || '0-0').split('-').map(Number);
                            return (
                              <div key={standing.userId} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium text-slate-300">
                                      {player?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">{player?.name || 'Unknown Player'}</div>
                                      <div className="text-xs text-slate-400">Rank #{standing.rank}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                      <span className="text-green-400 font-bold text-sm">{wins}</span>
                                      <span className="text-slate-500 mx-1">-</span>
                                      <span className="text-red-400 font-bold text-sm">{losses}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">Record</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Wins</label>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newWins = Math.max(0, wins - 1);
                                          handleScoreChange(standing.userId, newWins, losses);
                                        }}
                                        className="w-8 h-8 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="w-10 text-center text-sm font-medium text-white">{wins}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleScoreChange(standing.userId, wins + 1, losses);
                                        }}
                                        className="w-8 h-8 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Losses</label>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newLosses = Math.max(0, losses - 1);
                                          handleScoreChange(standing.userId, wins, newLosses);
                                        }}
                                        className="w-8 h-8 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="w-10 text-center text-sm font-medium text-white">{losses}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleScoreChange(standing.userId, wins, losses + 1);
                                        }}
                                        className="w-8 h-8 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs text-slate-400 block mb-1">Notes</label>
                                    <input
                                      type="text"
                                      value={standing.notes}
                                      onChange={(e) => handleStandingChange(standing.userId, 'notes', e.target.value)}
                                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                      placeholder="Add notes..."
                                    />
                                  </div>
                                  
                                  <button
                                    type="button"
                                    onClick={() => removeStanding(standing.userId)}
                                    className="w-full bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-medium py-2 transition-colors"
                                  >
                                    Remove Player
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : null}

                    {/* Desktop view: Table layout */}
                    {formData.standings && formData.standings.length > 0 ? (
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full border border-slate-700 rounded-lg">
                          <thead className="bg-slate-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider" title="Automatically calculated based on score">Rank*</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Player</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Score</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">W-L</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Notes</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-slate-900 divide-y divide-slate-800">
                            {formData.standings
                              ?.map((standing) => {
                              const player = players?.find(p => p.id === standing.userId);
                              const [wins, losses] = (standing.score || '0-0').split('-').map(Number);
                              return (
                                <tr key={standing.userId} className="hover:bg-slate-800/50 transition-colors">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={standing.rank}
                                      disabled
                                      className="w-16 bg-slate-700 border border-slate-600 rounded p-2 text-sm font-medium text-slate-300"
                                      min="1"
                                      title="Rank is automatically calculated based on score"
                                    />
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 mr-2">
                                        {player?.name?.charAt(0) || '?'}
                                      </div>
                                      <span className="text-sm font-medium text-white">
                                        {player?.name || 'Unknown Player'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center space-x-1">
                                      <div className="flex items-center">
                                        <span className="text-green-400 font-bold text-sm">{wins}</span>
                                        <span className="text-slate-500 mx-1">-</span>
                                        <span className="text-red-400 font-bold text-sm">{losses}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newWins = Math.max(0, wins - 1);
                                          handleScoreChange(standing.userId, newWins, losses);
                                        }}
                                        className="w-6 h-6 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm font-medium text-white">{wins}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleScoreChange(standing.userId, wins + 1, losses);
                                        }}
                                        className="w-6 h-6 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors"
                                      >
                                        +
                                      </button>
                                      
                                      <span className="mx-2 text-slate-500">|</span>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newLosses = Math.max(0, losses - 1);
                                          handleScoreChange(standing.userId, wins, newLosses);
                                        }}
                                        className="w-6 h-6 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-bold transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm font-medium text-white">{losses}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleScoreChange(standing.userId, wins, losses + 1);
                                        }}
                                        className="w-6 h-6 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-xs font-bold transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={standing.notes}
                                      onChange={(e) => handleStandingChange(standing.userId, 'notes', e.target.value)}
                                      className="w-32 bg-slate-700 border border-slate-600 rounded p-2 text-sm text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                      placeholder="Notes..."
                                    />
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => removeStanding(standing.userId)}
                                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                        <p className="text-sm">No standings added yet</p>
                        <p className="text-xs mt-1">Add participants and click "Generate from Participants" or add standings manually</p>
                      </div>
                    )}
                    
                    {/* Note about automatic rankings */}
                    {formData.standings && formData.standings.length > 0 && (
                      <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <p className="text-xs text-indigo-400">
                          <span className="font-medium">Note:</span> Rankings are automatically calculated based on player scores (primary: wins, secondary: win rate, tertiary: fewest losses). Rankings with * are calculated dynamically and included in saved tournament data.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-6 border-t border-slate-800">
                    <div>
                      {!isAddingNew && selectedTournament && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="w-full sm:w-auto px-4 py-3 sm:py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed min-h-[44px]"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 sm:py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors shadow-lg min-h-[44px] text-base sm:text-sm"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : (isAddingNew ? "Create Tournament" : "Save Changes")}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg">Select a tournament to edit details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;