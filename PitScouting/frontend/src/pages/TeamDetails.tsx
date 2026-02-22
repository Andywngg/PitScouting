import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TeamData, teamService, getImageUrl } from '../services/api';

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

const showValue = (value: string | number | null | undefined, suffix = '') =>
  value === null || value === undefined || value === '' ? '-' : `${value}${suffix}`;

const TeamDetails = () => {
  const { teamNumber } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamNumber || Number.isNaN(Number(teamNumber))) {
        toast.error('Invalid team number');
        navigate('/dashboard');
        return;
      }

      try {
        const data = await teamService.getTeam(Number(teamNumber));
        setTeam(data);
      } catch (error: any) {
        console.error('Error loading team:', error);
        toast.error(error.response?.data?.error || 'Failed to load team');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamNumber, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/75 p-6">
          Loading team...
        </div>
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.15),transparent_35%),linear-gradient(180deg,#0f172a_10%,#020617_80%)] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-900/75 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-300">Pit Scouting Detail</p>
          <h1 className="text-4xl font-black text-slate-50">Team {team.teamNumber}</h1>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5 text-slate-100">
            <h2 className="text-xl font-semibold text-amber-100">Scoring Output</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>Estimated Total Points: {showValue(team.estimatedTotalPoints)}</p>
              <p>
                Point Contribution: {team.pointContributionPercent ? `${team.pointContributionPercent}%` : '-'}
              </p>
              <p>Auto Can Score Balls: {team.autoCanScoreBalls ? 'Yes' : 'No'}</p>
              <p>
                Must Start Specific Spot: {team.mustStartSpecificPosition ? 'Yes' : 'No'}
                {team.mustStartSpecificPosition && team.autoStartingPosition
                  ? ` (${team.autoStartingPosition})`
                  : ''}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5 text-slate-100">
            <h2 className="text-xl font-semibold text-amber-100">Cycle and Shooting</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>Balls Per Cycle: {showValue(team.ballsPerCycle)}</p>
              <p>Cycles Per Match: {showValue(team.cyclesPerMatch)}</p>
              <p>Max Ball Capacity: {showValue(team.maxBallCapacity)}</p>
              <p>Shooting Types: {(team.shootingTypes || []).map(formatShootingType).join(', ') || '-'}</p>
              <p>
                Shooting Spots: {team.shootingLocationType === 'multiple' ? 'Multiple spots' : 'Single spot'}
              </p>
              <p>Shooting Spot Notes: {showValue(team.shootingLocationNotes)}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5 text-slate-100">
            <h2 className="text-xl font-semibold text-amber-100">Robot Specs</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>Width: {showValue(team.robotWidth, ' in')}</p>
              <p>Length: {showValue(team.robotLength, ' in')}</p>
              <p>Height: {showValue(team.robotHeight, ' in')}</p>
              <p>Weight: {showValue(team.robotWeight, ' lb')}</p>
              <p>Drivetrain: {showValue(team.drivetrainType)}</p>
              <p>Endgame: {formatEndgame(team.endgameType)}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5 text-slate-100">
            <h2 className="text-xl font-semibold text-amber-100">Notes and Photo</h2>
            <div className="mt-3 space-y-3 text-sm">
              <p className="whitespace-pre-wrap">{showValue(team.notes)}</p>
              {team.imageUrl ? (
                <img
                  src={getImageUrl(team.imageUrl)}
                  alt={`Team ${team.teamNumber} robot`}
                  className="max-h-72 w-full rounded-xl object-cover"
                />
              ) : (
                <p>No image uploaded.</p>
              )}
            </div>
          </section>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TeamDetails;
