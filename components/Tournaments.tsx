import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import { Tournament, TournamentFormData, Player } from "../types";

const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
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
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: "",
    email: "",
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
    setSelectedTournament(tournament);
    setFormData({
      name: tournament.name,
      date: tournament.date,
      game: tournament.game,
      season: tournament.season,
      status: tournament.status,
      participants: tournament.participants,
      maxPlayers: tournament.maxPlayers,
      standings: tournament.standings || []
    });
    setSuccessMessage(null);
    setIsAddingNew(false);
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
      
      // Automatically recalculate rankings when scores or notes change
      if (field === 'score') {
        return { ...prev, standings: calculateRankings(updatedStandings) };
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
    return standings
      .map(standing => {
        const [wins, losses] = (standing.score || '0-0').split('-').map(Number);
        return {
          ...standing,
          wins,
          losses,
          winRate: wins + losses > 0 ? wins / (wins + losses) : 0,
          totalGames: wins + losses
        };
      })
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
      
      // Automatically re-rank all players based on new scores
      const rankedStandings = calculateRankings(updatedStandings);
      
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
    const newStandings = formData.participants.map((userId, index) => {
      const existingStanding = formData.standings?.find(s => s.userId === userId);
      return existingStanding || {
        userId,
        rank: index + 1,
        score: "0-0",
        notes: ""
      };
    });
    setFormData((prev) => ({ ...prev, standings: newStandings }));
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
      // Calculate final rankings before saving
      const rankedStandings = formData.standings ? calculateRankings(formData.standings) : [];
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
      await apiService.deleteTournament(selectedTournament._id);
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
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Tournaments</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left Column: List */}
        <div className="w-1/3 bg-white shadow rounded-lg p-4 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Tournaments</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNewTournament}
                className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                + Add New
              </button>
              {loading && (
                <span className="text-xs text-gray-500">Syncing...</span>
              )}
            </div>
          </div>

          <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
            {tournaments.map((tournament) => (
              <li
                key={tournament._id}
                className={`cursor-pointer p-3 rounded-md transition-all ${
                  selectedTournament?._id === tournament._id
                    ? "bg-blue-50 border-blue-500 border-l-4 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
                onClick={() => handleSelectTournament(tournament)}
              >
                <div className="font-medium text-gray-900">{tournament.name}</div>
                <div className="text-sm text-gray-500">
                  {tournament.game} - Season {tournament.season}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(tournament.date).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Edit Form */}
        <div className="w-2/3 bg-white shadow rounded-lg p-6">
          {selectedTournament || isAddingNew ? (
            <div>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {isAddingNew ? 'Add New Tournament' : 'Edit Tournament'}
                </h2>
                {!isAddingNew && selectedTournament && (
                  <p className="text-sm text-gray-500">
                    ID: {selectedTournament._id}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tournament Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Game
                    </label>
                    <select
                      name="game"
                      value={formData.game}
                      onChange={handleInputChange}
                      className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Beyblade X">Beyblade X</option>
                      <option value="Beyblade Burst">Beyblade Burst</option>
                      <option value="Beyblade Metal Saga">Beyblade Metal Saga</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date.toISOString().slice(0, 16)}
                      onChange={handleInputChange}
                      className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Season
                    </label>
                    <input
                      type="number"
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      min="1"
                      className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Players
                    </label>
                    <input
                      type="number"
                      name="maxPlayers"
                      value={formData.maxPlayers}
                      onChange={handleInputChange}
                      min="2"
                      className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Participants ({formData.participants.length}/{formData.maxPlayers})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddPlayer(!showAddPlayer)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      + Quick Add Player
                    </button>
                  </div>
                  
                  {/* Quick Add Player Form */}
                  {showAddPlayer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-3">Add New Player</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={newPlayer.name || ""}
                            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                            className="w-full text-sm text-black border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Player name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={newPlayer.email || ""}
                            onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                            className="w-full text-sm text-black border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="player@email.com"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddPlayer(false);
                            setNewPlayer({
                              name: "",
                              email: "",
                              beybladeStats: {
                                spinFinishes: 0,
                                overFinishes: 0,
                                burstFinishes: 0,
                                extremeFinishes: 0,
                              }
                            });
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddPlayer}
                          disabled={loading || !newPlayer.name || !newPlayer.email}
                          className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                        >
                          Add Player
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {players.map((player) => (
                      <label
                        key={player.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.participants.includes(player.id)}
                          onChange={() => handleParticipantToggle(player.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{player.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Match Logging */}
                {formData.standings && formData.standings.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                      Log Match Results
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Winner</label>
                          <select
                            id="winner-select"
                            className="w-full text-black border border-gray-300 rounded-md p-2 text-sm"
                          >
                            <option value="">Select winner</option>
                            {formData.standings.map((standing) => {
                              const player = players.find(p => p.id === standing.userId);
                              return (
                                <option key={standing.userId} value={standing.userId}>
                                  {player?.name || 'Unknown'}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Loser</label>
                          <select
                            id="loser-select"
                            className="w-full text-black border border-gray-300 rounded-md p-2 text-sm"
                          >
                            <option value="">Select loser</option>
                            {formData.standings.map((standing) => {
                              const player = players.find(p => p.id === standing.userId);
                              return (
                                <option key={standing.userId} value={standing.userId}>
                                  {player?.name || 'Unknown'}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const winnerSelect = document.getElementById('winner-select') as HTMLSelectElement;
                              const loserSelect = document.getElementById('loser-select') as HTMLSelectElement;
                              if (winnerSelect.value && loserSelect.value && winnerSelect.value !== loserSelect.value) {
                                addMatchResult(winnerSelect.value, loserSelect.value);
                                winnerSelect.value = '';
                                loserSelect.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
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
                  <div className="flex justify-between items-center mb-3 border-b pb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Tournament Standings ({formData.standings?.length || 0})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={generateStandingsFromParticipants}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                        disabled={formData.participants.length === 0}
                      >
                        Generate from Participants
                      </button>
                    </div>
                  </div>
                  
                  {formData.standings && formData.standings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Automatically calculated based on score">Rank*</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W-L</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.standings
                            .sort((a, b) => a.rank - b.rank)
                            .map((standing) => {
                            const player = players.find(p => p.id === standing.userId);
                            const [wins, losses] = (standing.score || '0-0').split('-').map(Number);
                            const draws = 0; // Remove draws
                            return (
                              <tr key={standing.userId} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={standing.rank}
                                    disabled
                                    className="w-16 text-black border border-gray-300 rounded p-1 text-sm font-medium bg-gray-100"
                                    min="1"
                                    title="Rank is automatically calculated based on score"
                                  />
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mr-2">
                                      {player?.name?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {player?.name || 'Unknown Player'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center space-x-1">
                                    <div className="flex items-center">
                                      <span className="text-green-600 font-bold text-sm">{wins}</span>
                                      <span className="text-gray-400 mx-1">-</span>
                                      <span className="text-red-600 font-bold text-sm">{losses}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newWins = Math.max(0, wins - 1);
                                        handleScoreChange(standing.userId, newWins, losses);
                                      }}
                                      className="w-6 h-6 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">{wins}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleScoreChange(standing.userId, wins + 1, losses);
                                      }}
                                      className="w-6 h-6 bg-green-100 text-green-600 rounded hover:bg-green-200 text-xs font-bold"
                                    >
                                      +
                                    </button>
                                    
                                    <span className="mx-2 text-gray-400">|</span>
                                    
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newLosses = Math.max(0, losses - 1);
                                        handleScoreChange(standing.userId, wins, newLosses);
                                      }}
                                      className="w-6 h-6 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium">{losses}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleScoreChange(standing.userId, wins, losses + 1);
                                      }}
                                      className="w-6 h-6 bg-green-100 text-green-600 rounded hover:bg-green-200 text-xs font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={standing.notes}
                                    onChange={(e) => handleStandingChange(standing.userId, 'notes', e.target.value)}
                                    className="w-32 text-black border border-gray-300 rounded p-1 text-sm"
                                    placeholder="Notes..."
                                  />
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => removeStanding(standing.userId)}
                                    className="text-red-600 hover:text-red-800 text-sm"
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
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
                      <p className="text-sm">No standings added yet</p>
                      <p className="text-xs mt-1">Add participants and click "Generate from Participants" or add standings manually</p>
                    </div>
                  )}
                  
                  {/* Note about automatic rankings */}
                  {formData.standings && formData.standings.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-700">
                        <span className="font-medium">Note:</span> Rankings are automatically calculated based on player scores (primary: wins, secondary: win rate, tertiary: fewest losses). Rankings with * are calculated dynamically and included in the saved tournament data.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <div>
                    {!isAddingNew && selectedTournament && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors shadow-sm"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : (isAddingNew ? "Create Tournament" : "Save Changes")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
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
  );
};

export default Tournaments;