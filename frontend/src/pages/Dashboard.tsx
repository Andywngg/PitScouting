import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { teamService, TeamData, getImageUrl } from '../services/api';

const formatShootingType = (value: string) => {
  switch (value) {
    case 'high_goal':
      return 'High Goal';
    case 'low_goal':
      return 'Low Goal';
    case 'fender_close':
      return 'Close/Fender';
    case 'long_range':
      return 'Long Range';
    default:
      return value;
  }
};

const formatEndgame = (value: string) => {
  switch (value) {
    case 'high':
      return 'High';
    case 'low':
      return 'Low';
    case 'none':
      return 'None';
    default:
      return '-';
  }
};

const safeValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === '' ? '-' : value;

const Dashboard = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrivetrain, setFilterDrivetrain] = useState('');
  const [filterShootingLocation, setFilterShootingLocation] = useState('');
  const [filterEndgameType, setFilterEndgameType] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getAllTeams();
        setTeams(data);
      } catch (error: any) {
        console.error('Error fetching teams:', error);
        toast.error(error.response?.data?.error || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesTeam =
        searchTerm.trim() === '' || team.teamNumber.toString().includes(searchTerm.trim());
      const matchesDrivetrain =
        filterDrivetrain.trim() === '' ||
        (team.drivetrainType || '').toLowerCase().includes(filterDrivetrain.toLowerCase());
      const matchesLocation =
        filterShootingLocation === '' || team.shootingLocationType === filterShootingLocation;
      const matchesEndgame = filterEndgameType === '' || team.endgameType === filterEndgameType;

      return matchesTeam && matchesDrivetrain && matchesLocation && matchesEndgame;
    });
  }, [teams, searchTerm, filterDrivetrain, filterShootingLocation, filterEndgameType]);

  const handleExport = () => {
    const headers = [
      'Team Number',
      'Estimated Total Points',
      'Point Contribution Percent',
      'Balls Per Cycle',
      'Cycles Per Match',
      'Max Ball Capacity',
      'Auto Can Score Balls',
      'Shooting Types',
      'Shooting Location Type',
      'Shooting Location Notes',
      'Endgame',
      'Drivetrain',
      'Notes',
    ];

    const rows = filteredTeams.map((team) => [
      team.teamNumber,
      safeValue(team.estimatedTotalPoints),
      team.pointContributionPercent ? `${team.pointContributionPercent}%` : '-',
      safeValue(team.ballsPerCycle),
      safeValue(team.cyclesPerMatch),
      safeValue(team.maxBallCapacity),
      team.autoCanScoreBalls ? 'Yes' : 'No',
      (team.shootingTypes || []).map(formatShootingType).join(' | ') || '-',
      team.shootingLocationType === 'multiple' ? 'Multiple spots' : 'Single spot',
      safeValue(team.shootingLocationNotes),
      formatEndgame(team.endgameType),
      safeValue(team.drivetrainType),
      safeValue(team.notes),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pit-scouting-2026.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6">
          Loading teams...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.15),transparent_35%),linear-gradient(180deg,#0f172a_10%,#020617_80%)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/75 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-300">Pit Scouting</p>
            <h1 className="text-3xl font-black text-slate-50">Dashboard 2026</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/scout')}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2 text-white"
            >
              New Scout
            </Button>
            <Button
              onClick={handleExport}
              variant="secondary"
              className="rounded-xl border border-slate-500 bg-slate-800 px-5 py-2 text-white"
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-900/75 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search team #"
              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-slate-100 placeholder-slate-400"
            />
            <input
              type="text"
              value={filterDrivetrain}
              onChange={(event) => setFilterDrivetrain(event.target.value)}
              placeholder="Filter drivetrain"
              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-slate-100 placeholder-slate-400"
            />
            <select
              value={filterShootingLocation}
              onChange={(event) => setFilterShootingLocation(event.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-slate-100"
            >
              <option value="">All shooting locations</option>
              <option value="single">Single spot</option>
              <option value="multiple">Multiple spots</option>
            </select>
            <select
              value={filterEndgameType}
              onChange={(event) => setFilterEndgameType(event.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-slate-100"
            >
              <option value="">All endgame types</option>
              <option value="high">High</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-8 text-center text-slate-300">
            No teams found with the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-900/75">
            <table className="min-w-full divide-y divide-slate-700/80">
              <thead className="bg-slate-950/70">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Total Pts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Balls/Cycle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Cycles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Shooting
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Spots
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Endgame
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Image
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTeams.map((team) => (
                  <tr
                    key={team.teamNumber}
                    onClick={() => navigate(`/team/${team.teamNumber}`)}
                    className="cursor-pointer bg-slate-900/30 hover:bg-slate-800/70"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-amber-100">{team.teamNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">{safeValue(team.estimatedTotalPoints)}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {team.pointContributionPercent ? `${team.pointContributionPercent}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">{safeValue(team.ballsPerCycle)}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">{safeValue(team.cyclesPerMatch)}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">{safeValue(team.maxBallCapacity)}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {(team.shootingTypes || []).map(formatShootingType).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {team.shootingLocationType === 'multiple' ? 'Multiple' : 'Single'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">{formatEndgame(team.endgameType)}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {team.imageUrl ? (
                        <img
                          src={getImageUrl(team.imageUrl)}
                          alt={`Team ${team.teamNumber} robot`}
                          className="h-14 w-14 rounded-lg object-cover"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.open(getImageUrl(team.imageUrl as string), '_blank');
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
