import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HackathonEvent, HackathonTeam } from '../types';
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
  Crown,
  Send,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  LogIn,
} from 'lucide-react';

const ROLE_PRESETS = ['Developer', 'Designer', 'Researcher', 'AI / ML', 'Backend', 'Presenter'];
const TEAM_SIZE_OPTIONS = [2, 3, 4, 5];

export const HackathonsSection: React.FC = () => {
  const {
    hackathons,
    hackathonTeams,
    currentUser,
    setIsRegisterModalOpen,
    setRegisterModalTab,
    submitHackathonRequest,
    createHackathonTeam,
    requestToJoinHackathonTeam,
    respondToJoinRequest,
    isMyCaptainTeam,
    isMyJoinRequest,
  } = useApp();

  const isVerifiedMember = Boolean(currentUser && currentUser.status === 'APPROVED');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'WITH_TEAMS' | 'MY_ACTIVITY'>('ALL');
  const [expandedHackathonIds, setExpandedHackathonIds] = useState<Record<string, boolean>>({});
  const [bannerToast, setBannerToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal: Request to Add Hackathon / Event
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqOrg, setReqOrg] = useState('');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqDates, setReqDates] = useState('');
  const [reqLink, setReqLink] = useState('');
  const [reqPrize, setReqPrize] = useState('');
  const [reqTeamSize, setReqTeamSize] = useState('');
  const [isSubmittingHack, setIsSubmittingHack] = useState(false);

  // Modal: Create Team
  const [createTeamHackathon, setCreateTeamHackathon] = useState<HackathonEvent | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [captainNameInput, setCaptainNameInput] = useState(currentUser?.name || '');
  const [captainRollInput, setCaptainRollInput] = useState(
    currentUser?.rollNumber ? String(currentUser.rollNumber) : ''
  );
  const [teamMaxSize, setTeamMaxSize] = useState<number>(4);

  // Modal: Request to Join Team (2-step when multiple teams exist)
  const [joinHackathon, setJoinHackathon] = useState<HackathonEvent | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [joinStep, setJoinStep] = useState<'SELECT_TEAM' | 'FILL_DETAILS'>('SELECT_TEAM');
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantRole, setApplicantRole] = useState('Developer');
  const [applicantRoll, setApplicantRoll] = useState(
    currentUser?.rollNumber ? String(currentUser.rollNumber) : ''
  );

  // Modal: Verified Member Gate Pop-up (when unverified / guest clicks Create Team or Request to Join)
  const [authGatePrompt, setAuthGatePrompt] = useState<{
    action: 'CREATE_TEAM' | 'JOIN_TEAM';
    hackathonTitle: string;
  } | null>(null);

  // Modal: View Team Members Roster (Captain at top + Teammates with Roll No. & Role)
  const [viewingTeamId, setViewingTeamId] = useState<string | null>(null);
  const viewingTeam = useMemo(
    () => hackathonTeams.find((t) => t.id === viewingTeamId) || null,
    [hackathonTeams, viewingTeamId]
  );

  const showNotice = (type: 'success' | 'error', text: string) => {
    setBannerToast({ type, text });
    setTimeout(() => setBannerToast(null), 4500);
  };

  const approvedHackathons = useMemo(
    () => hackathons.filter((h) => h.status === 'APPROVED'),
    [hackathons]
  );

  const teamsByHackathon = useMemo(() => {
    const map = new Map<string, HackathonTeam[]>();
    for (const t of hackathonTeams) {
      const list = map.get(t.hackathonId) || [];
      list.push(t);
      map.set(t.hackathonId, list);
    }
    return map;
  }, [hackathonTeams]);

  const filteredHackathons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return approvedHackathons.filter((h) => {
      const hTeams = teamsByHackathon.get(h.id) || [];
      if (filterMode === 'WITH_TEAMS' && hTeams.length === 0) return false;
      if (filterMode === 'MY_ACTIVITY') {
        const involved = hTeams.some(
          (t) =>
            isMyCaptainTeam(t) ||
            (t.joinRequests || []).some((r) => isMyJoinRequest(r))
        );
        if (!involved) return false;
      }
      if (!q) return true;
      return (
        h.title.toLowerCase().includes(q) ||
        (h.organizedBy || '').toLowerCase().includes(q) ||
        (h.prizePool || '').toLowerCase().includes(q) ||
        (h.category || '').toLowerCase().includes(q)
      );
    });
  }, [approvedHackathons, teamsByHackathon, searchQuery, filterMode, isMyCaptainTeam, isMyJoinRequest]);

  const toggleExpand = (id: string) => {
    setExpandedHackathonIds((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const openCreateTeamModal = (hackathon: HackathonEvent) => {
    if (!isVerifiedMember) {
      setAuthGatePrompt({ action: 'CREATE_TEAM', hackathonTitle: hackathon.title });
      return;
    }
    setCreateTeamHackathon(hackathon);
    setTeamNameInput('');
    setCaptainNameInput(currentUser?.name || '');
    setCaptainRollInput(currentUser?.rollNumber ? String(currentUser.rollNumber) : '');
    setTeamMaxSize(4);
  };

  const openJoinTeamModal = (hackathon: HackathonEvent, preselectedTeamId?: string) => {
    if (!isVerifiedMember) {
      setAuthGatePrompt({ action: 'JOIN_TEAM', hackathonTitle: hackathon.title });
      return;
    }
    const hTeams = teamsByHackathon.get(hackathon.id) || [];
    setJoinHackathon(hackathon);
    setApplicantName(currentUser?.name || '');
    setApplicantRole('Developer');
    setApplicantRoll(currentUser?.rollNumber ? String(currentUser.rollNumber) : '');

    if (preselectedTeamId) {
      setSelectedTeamId(preselectedTeamId);
      setJoinStep('FILL_DETAILS');
    } else if (hTeams.length === 1) {
      setSelectedTeamId(hTeams[0].id);
      setJoinStep('FILL_DETAILS');
    } else {
      setSelectedTeamId('');
      setJoinStep('SELECT_TEAM');
    }
  };

  const handleRequestHackathonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) {
      showNotice('error', 'Title Name is mandatory!');
      return;
    }
    setIsSubmittingHack(true);
    const res = await submitHackathonRequest({
      title: reqTitle,
      organizedBy: reqOrg,
      registrationDeadline: reqDeadline,
      hackathonDates: reqDates,
      registrationLink: reqLink,
      prizePool: reqPrize,
      teamSizeInfo: reqTeamSize,
    });
    setIsSubmittingHack(false);
    if (res.success) {
      showNotice('success', res.message);
      setIsAddModalOpen(false);
      setReqTitle('');
      setReqOrg('');
      setReqDeadline('');
      setReqDates('');
      setReqLink('');
      setReqPrize('');
      setReqTeamSize('');
    } else {
      showNotice('error', res.message);
    }
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamHackathon) return;
    const res = await createHackathonTeam({
      hackathonId: createTeamHackathon.id,
      teamName: teamNameInput,
      captainName: captainNameInput,
      captainRoll: captainRollInput,
      maxSize: teamMaxSize,
    });
    if (res.success) {
      showNotice('success', res.message);
      setExpandedHackathonIds((prev) => ({ ...prev, [createTeamHackathon.id]: true }));
      setCreateTeamHackathon(null);
    } else {
      showNotice('error', res.message);
    }
  };

  const handleJoinTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      showNotice('error', 'Please select a team to join or create a new team first.');
      return;
    }
    const res = await requestToJoinHackathonTeam(selectedTeamId, {
      name: applicantName,
      role: applicantRole,
      rollNumber: applicantRoll,
    });
    if (res.success) {
      showNotice('success', res.message);
      if (joinHackathon) {
        setExpandedHackathonIds((prev) => ({ ...prev, [joinHackathon.id]: true }));
      }
      setJoinHackathon(null);
    } else {
      showNotice('error', res.message);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Toast Notification */}
      {bannerToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 border-2 shadow-[6px_6px_0_#060410] flex items-center gap-2.5 text-xs font-bold backdrop-blur-xl animate-in fade-in ${
            bannerToast.type === 'success'
              ? 'bg-[#150c28]/95 border-[#52b788] text-[#f4e6c8]'
              : 'bg-[#150c28]/95 border-[#d34c53] text-[#fff4d6]'
          }`}
        >
          {bannerToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#f47b5c] shrink-0" />
          )}
          <span>{bannerToast.text}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/65 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 border-2 border-[#f4e6c8] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
              <Trophy className="w-6 h-6 text-[#1a1030]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#f9c74f] uppercase tracking-wider">
                  Hackathons / Events
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#241548] text-[#52b788] border border-[#52b788]">
                  {approvedHackathons.length} LIVE EVENTS
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#241548] text-[#f47b5c] border border-[#4b2f7e]">
                  {hackathonTeams.length} TEAMS FORMED
                </span>
              </div>
              <p className="text-xs text-[#b9a7e8] mt-1">
                Explore upcoming hackathons, create a team or request to join classmates, and submit new events for Admin approval.
              </p>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="pixel-btn text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Request to Add Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a08fd4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hackathons by title, college/organizer, or prize pool..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#150c28]/80 border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs text-[#f4e6c8] placeholder-[#a08fd4]/70 focus:outline-none shadow-[3px_3px_0_#060410]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'ALL', label: `All (${approvedHackathons.length})` },
              {
                id: 'WITH_TEAMS',
                label: `Teams Forming (${approvedHackathons.filter((h) => (teamsByHackathon.get(h.id) || []).length > 0).length})`,
              },
              { id: 'MY_ACTIVITY', label: 'My Teams & Requests' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-2 cursor-pointer transition-colors whitespace-nowrap ${
                filterMode === f.id
                  ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8]'
                  : 'bg-[#1a1030]/80 text-[#b9a7e8] border-[#4b2f7e] hover:border-[#f9c74f]/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathon List Grid */}
      {filteredHackathons.length === 0 ? (
        <div className="border-2 border-[#4b2f7e] bg-[#150c28]/65 p-10 text-center space-y-3">
          <Trophy className="w-10 h-10 text-[#f9c74f]/60 mx-auto" />
          <p className="text-sm font-bold text-[#f4e6c8]">No hackathons match your current filter.</p>
          <p className="text-xs text-[#a08fd4]">
            Try clearing your search or submit a new Hackathon/Event request to the Admin!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredHackathons.map((hack) => {
            const hTeams = teamsByHackathon.get(hack.id) || [];
            const isExpanded = expandedHackathonIds[hack.id] ?? true;
            const totalPendingForMyCaptainTeams = hTeams.reduce(
              (acc, t) =>
                acc +
                (isMyCaptainTeam(t)
                  ? (t.joinRequests || []).filter((r) => r.status === 'PENDING').length
                  : 0),
              0
            );

            return (
              <div
                key={hack.id}
                className="border-2 border-[#4b2f7e]/85 bg-[#150c28]/70 backdrop-blur-xl p-4 sm:p-5 shadow-[5px_5px_0_rgba(6,4,16,0.75)] flex flex-col justify-between gap-4 hover:border-[#f9c74f]/80 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]">
                      {hack.category || 'Hackathon / Event'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {hack.prizePool && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2d6a4f]/30 text-[#52b788] border border-[#52b788]">
                          🏆 {hack.prizePool}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Organizer */}
                  <div>
                    <h3 className="text-base font-bold text-[#fff4d6] leading-snug">
                      {hack.title}
                    </h3>
                    <p className="text-xs text-[#b9a7e8] mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#f47b5c] shrink-0" />
                      <span>{hack.organizedBy || 'Independent / TBA'}</span>
                    </p>
                  </div>

                  {/* Compact Dates / Deadline / Size Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-[#1a1030]/85 border border-[#4b2f7e] p-2.5">
                    <div>
                      <span className="text-[#a08fd4] block text-[10px] uppercase">Deadline</span>
                      <span className="text-[#f47b5c] font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate" title={hack.registrationDeadline}>
                          {hack.registrationDeadline || 'TBA'}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[#a08fd4] block text-[10px] uppercase">Event Dates</span>
                      <span className="text-[#f4e6c8] font-bold flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#f9c74f] shrink-0" />
                        <span className="truncate" title={hack.hackathonDates}>
                          {hack.hackathonDates || 'TBA'}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[#a08fd4] block text-[10px] uppercase">Allowed Size</span>
                      <span className="text-[#f9c74f] font-bold flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 shrink-0" />
                        <span className="truncate" title={hack.teamSizeInfo}>
                          {hack.teamSizeInfo || 'Open'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Official Registration URL & Dropdown Toggle for Created Teams */}
                  {((hack.registrationLink && hack.registrationLink !== '#') || hTeams.length > 0) && (
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                      {hack.registrationLink && hack.registrationLink !== '#' ? (
                        <a
                          href={hack.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#f9c74f] hover:text-[#fff4d6] underline decoration-[#4b2f7e] hover:decoration-[#f9c74f] font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Official Event / Unstop Page</span>
                        </a>
                      ) : (
                        <span />
                      )}

                      {hTeams.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(hack.id)}
                          aria-expanded={isExpanded}
                          className="px-2.5 py-1 bg-[#2d6a4f]/30 hover:bg-[#2d6a4f]/55 border border-[#52b788] text-[11px] font-bold text-[#52b788] hover:text-[#fff4d6] flex items-center gap-1.5 cursor-pointer transition-colors"
                          title={isExpanded ? 'Hide created teams' : 'Show created teams'}
                        >
                          <span>
                            {hTeams.length} {hTeams.length === 1 ? 'Team' : 'Teams'} Created
                          </span>
                          {totalPendingForMyCaptainTeams > 0 && (
                            <span className="px-1.5 py-0.2 bg-[#d34c53] text-white text-[9px] border border-[#f4e6c8]">
                              {totalPendingForMyCaptainTeams} req
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Teams Created List (Toggleable via the green 'X Team(s) Created' dropdown; click any team to view members) */}
                  {hTeams.length > 0 && isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-[#4b2f7e]/70">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#a08fd4] flex items-center justify-between">
                        <span>Created Teams ({hTeams.length})</span>
                        <span>Click any team for roster</span>
                      </div>

                      {hTeams.map((team) => {
                        const acceptedCount = (team.members || []).length;
                        const spacesLeft = Math.max(0, team.maxSize - acceptedCount);
                        const isFull = spacesLeft === 0;
                        const isCaptain = isMyCaptainTeam(team);
                        const pendingReqs = (team.joinRequests || []).filter((r) => r.status === 'PENDING');
                        const myReq = (team.joinRequests || []).find((r) => isMyJoinRequest(r));

                        return (
                          <div
                            key={team.id}
                            onClick={() => setViewingTeamId(team.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setViewingTeamId(team.id);
                              }
                            }}
                            className="p-2.5 bg-[#1a1030]/95 border border-[#4b2f7e] hover:border-[#f9c74f] space-y-2 text-xs cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-[#fff4d6]">{team.teamName}</span>
                                  {isCaptain && (
                                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#f9c74f] text-[#1a1030]">
                                      YOUR TEAM
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#b9a7e8] flex items-center gap-1 mt-0.5">
                                  <Crown className="w-3 h-3 text-[#f9c74f] shrink-0" />
                                  <span>Captain: <strong className="text-[#f4e6c8]">{team.captainName}</strong></span>
                                  {team.captainRoll && <span className="text-[#a08fd4]">(Roll #{team.captainRoll})</span>}
                                </p>
                              </div>

                              {/* Exact 0/4 counter badge */}
                              <div className="text-right shrink-0">
                                <span
                                  className={`inline-block px-2 py-0.5 text-[11px] font-bold border ${
                                    isFull
                                      ? 'bg-[#d34c53]/25 border-[#d34c53] text-[#f47b5c]'
                                      : 'bg-[#2d6a4f]/30 border-[#52b788] text-[#52b788]'
                                  }`}
                                >
                                  {acceptedCount}/{team.maxSize}
                                </span>
                                <span className="block text-[9px] text-[#a08fd4] mt-0.5">
                                  {isFull
                                    ? 'Team Full'
                                    : `${spacesLeft} ${spacesLeft === 1 ? 'space' : 'spaces'} left`}
                                </span>
                              </div>
                            </div>

                            {/* Accepted Members preview + click cue */}
                            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                              {acceptedCount > 0 ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(team.members || []).map((m) => (
                                    <span
                                      key={m.id}
                                      className="px-2 py-0.5 text-[10px] bg-[#241548] border border-[#4b2f7e] text-[#f4e6c8]"
                                    >
                                      {m.name} · <span className="text-[#f9c74f]">{m.role}</span> (Roll #{m.rollNumber})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-[#a08fd4]">No teammates joined yet</span>
                              )}
                              <span className="text-[10px] font-bold text-[#f9c74f] ml-auto">
                                View Team Roster →
                              </span>
                            </div>

                            {/* My request status badge for applicant */}
                            {myReq && !isCaptain && (
                              <div className="text-[10px] font-bold">
                                {myReq.status === 'PENDING' && (
                                  <span className="text-[#f9c74f]">⏳ Your request ({myReq.role}) is pending captain approval</span>
                                )}
                                {myReq.status === 'ACCEPTED' && (
                                  <span className="text-[#52b788]">✓ You are accepted in this team ({myReq.role})</span>
                                )}
                                {myReq.status === 'DENIED' && (
                                  <span className="text-[#f47b5c]">✕ Your request was denied by {team.captainName}</span>
                                )}
                              </div>
                            )}

                            {/* Inline Captain Pending Requests Quick Controls */}
                            {isCaptain && pendingReqs.length > 0 && (
                              <div
                                className="pt-1.5 border-t border-[#4b2f7e]/60 space-y-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] font-bold text-[#f9c74f] uppercase">
                                  Pending Join Requests ({pendingReqs.length}):
                                </span>
                                {pendingReqs.map((req) => (
                                  <div
                                    key={req.id}
                                    className="flex items-center justify-between gap-2 bg-[#241548]/80 px-2 py-1.5 border border-[#4b2f7e]"
                                  >
                                    <div className="text-[11px] min-w-0">
                                      <span className="font-bold text-white">{req.name}</span>{' '}
                                      <span className="text-[#f9c74f]">({req.role})</span>{' '}
                                      <span className="text-[#a08fd4]">· Roll #{req.rollNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        disabled={isFull}
                                        onClick={() => respondToJoinRequest(team.id, req.id, 'ACCEPTED')}
                                        className="px-2 py-0.5 bg-[#52b788] hover:bg-[#6ee7b7] disabled:opacity-40 text-[#1a1030] font-bold text-[10px] cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => respondToJoinRequest(team.id, req.id, 'DENIED')}
                                        className="px-2 py-0.5 bg-[#d34c53] hover:bg-[#ef4444] text-white font-bold text-[10px] cursor-pointer"
                                      >
                                        Deny
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Primary Two Action Buttons: Create Team & Request to Join */}
                <div className="pt-3 border-t-2 border-[#4b2f7e]/70 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => openCreateTeamModal(hack)}
                    className="pixel-btn text-xs py-2! px-3! flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openJoinTeamModal(hack)}
                    className="pixel-btn-secondary text-xs py-2! px-3! flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#f9c74f]" />
                    <span>Request to Join</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          MODAL 1: REQUEST TO ADD NEW HACKATHON / EVENT
      ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060410]/85 backdrop-blur-md font-mono">
          <div className="border-2 border-[#f4e6c8] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Request to Add Hackathon / Event
                </h3>
                <p className="text-[11px] text-[#a08fd4] mt-0.5">
                  Submitted requests pop up in the Admin Dashboard for approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestHackathonSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                  Event / Hackathon Title <span className="text-[#f47b5c]">* Mandatory</span>
                </label>
                <input
                  type="text"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Smart India Hackathon 2026"
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                  Organized By (College / Organization)
                </label>
                <input
                  type="text"
                  value={reqOrg}
                  onChange={(e) => setReqOrg(e.target.value)}
                  placeholder="e.g. Thakur College of Engineering & Technology"
                  className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                    Registration Deadline
                  </label>
                  <input
                    type="text"
                    value={reqDeadline}
                    onChange={(e) => setReqDeadline(e.target.value)}
                    placeholder="e.g. 20 Dec 2026, 11:59 PM"
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                    Hackathon Dates
                  </label>
                  <input
                    type="text"
                    value={reqDates}
                    onChange={(e) => setReqDates(e.target.value)}
                    placeholder="e.g. 26–27 Dec 2026"
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={reqPrize}
                    onChange={(e) => setReqPrize(e.target.value)}
                    placeholder="e.g. ₹1,00,000 + Goodies"
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                    Team Size Info
                  </label>
                  <input
                    type="text"
                    value={reqTeamSize}
                    onChange={(e) => setReqTeamSize(e.target.value)}
                    placeholder="e.g. 2–4 Members"
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                  Registration Link (URL)
                </label>
                <input
                  type="url"
                  value={reqLink}
                  onChange={(e) => setReqLink(e.target.value)}
                  placeholder="https://unstop.com/..."
                  className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-[#4b2f7e]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingHack}
                  className="pixel-btn text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingHack ? 'Sending...' : 'Send Request to Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: CREATE A TEAM
      ==================================================================== */}
      {createTeamHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060410]/85 backdrop-blur-md font-mono">
          <div className="border-2 border-[#f4e6c8] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Create Hackathon Team
                </h3>
                <p className="text-[11px] text-[#b9a7e8] mt-0.5 truncate max-w-[300px]">
                  {createTeamHackathon.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateTeamHackathon(null)}
                className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                  Team Name <span className="text-[#f47b5c]">*</span>
                </label>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="e.g. ByteBuilders"
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                    Team Leader / Captain Name <span className="text-[#f47b5c]">*</span>
                  </label>
                  <input
                    type="text"
                    value={captainNameInput}
                    onChange={(e) => setCaptainNameInput(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                    Roll No.
                  </label>
                  <input
                    type="text"
                    value={captainRollInput}
                    onChange={(e) => setCaptainRollInput(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1.5 uppercase">
                  Members Wanted in Team (Starts at 0/{teamMaxSize})
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TEAM_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamMaxSize(size)}
                      className={`py-2 font-bold border-2 cursor-pointer transition-colors ${
                        teamMaxSize === size
                          ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8]'
                          : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:border-[#f9c74f]'
                      }`}
                    >
                      {size} Members
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#52b788] mt-1.5">
                  Team counter starts at <strong>0/{teamMaxSize}</strong> ({teamMaxSize} spaces left) and increments as you accept join requests.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-[#4b2f7e]">
                <button
                  type="button"
                  onClick={() => setCreateTeamHackathon(null)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="pixel-btn text-xs">
                  ▶ Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: REQUEST TO JOIN A TEAM
      ==================================================================== */}
      {joinHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060410]/85 backdrop-blur-md font-mono">
          <div className="border-2 border-[#f4e6c8] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Request to Join Team
                </h3>
                <p className="text-[11px] text-[#b9a7e8] mt-0.5 truncate max-w-[340px]">
                  {joinHackathon.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJoinHackathon(null)}
                className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const availableTeams = teamsByHackathon.get(joinHackathon.id) || [];
              if (availableTeams.length === 0) {
                return (
                  <div className="p-5 bg-[#241548]/70 border-2 border-[#4b2f7e] text-center space-y-3">
                    <Users className="w-8 h-8 text-[#f9c74f] mx-auto" />
                    <p className="text-xs font-bold text-[#f4e6c8]">
                      No teams have been created for this hackathon yet!
                    </p>
                    <p className="text-[11px] text-[#a08fd4]">
                      Be the first captain and create a team for classmates to join.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const hack = joinHackathon;
                        setJoinHackathon(null);
                        openCreateTeamModal(hack);
                      }}
                      className="pixel-btn text-xs mx-auto"
                    >
                      + Create Team Instead
                    </button>
                  </div>
                );
              }

              const selectedTeam = availableTeams.find((t) => t.id === selectedTeamId) || null;

              if (joinStep === 'SELECT_TEAM' || !selectedTeam) {
                return (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-[#241548]/80 border-2 border-[#f9c74f]/60 space-y-1">
                      <div className="font-bold text-[#f9c74f] uppercase tracking-wider">
                        Multiple Teams Available ({availableTeams.length})
                      </div>
                      <p className="text-[11px] text-[#f4e6c8]">
                        Which team would you like to select? Pick a team below to fill your details and send a join request to its captain.
                      </p>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {availableTeams.map((team) => {
                        const accepted = (team.members || []).length;
                        const spacesLeft = Math.max(0, team.maxSize - accepted);
                        const isFull = spacesLeft === 0;
                        const isCaptain = isMyCaptainTeam(team);
                        const myReq = (team.joinRequests || []).find((r) => isMyJoinRequest(r));
                        const hasPendingOrAccepted = myReq?.status === 'PENDING' || myReq?.status === 'ACCEPTED';
                        const isDisabled = isFull || isCaptain || hasPendingOrAccepted;

                        return (
                          <button
                            key={team.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setJoinStep('FILL_DETAILS');
                            }}
                            className={`w-full p-3 border-2 text-left flex items-center justify-between gap-3 transition-colors ${
                              isDisabled
                                ? 'opacity-55 bg-[#1a1030] border-[#4b2f7e] cursor-not-allowed'
                                : 'bg-[#241548]/75 border-[#4b2f7e] hover:border-[#f9c74f] hover:bg-[#241548] text-[#f4e6c8] cursor-pointer'
                            }`}
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-[#fff4d6]">{team.teamName}</span>
                                {isCaptain && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#f9c74f] text-[#1a1030]">
                                    YOUR TEAM
                                  </span>
                                )}
                                {myReq?.status === 'PENDING' && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#f9c74f]/20 border border-[#f9c74f] text-[#f9c74f]">
                                    PENDING
                                  </span>
                                )}
                                {myReq?.status === 'ACCEPTED' && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#2d6a4f]/40 border border-[#52b788] text-[#52b788]">
                                    JOINED
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#b9a7e8] flex items-center gap-1">
                                <Crown className="w-3 h-3 text-[#f9c74f] shrink-0" />
                                <span>
                                  Captain: <strong className="text-[#f9c74f]">{team.captainName}</strong>
                                </span>
                                {team.captainRoll && <span className="text-[#a08fd4]">(Roll #{team.captainRoll})</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="text-right">
                                <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-[#150c28] border border-[#52b788] text-[#52b788]">
                                  {accepted}/{team.maxSize}
                                </span>
                                <span className="block text-[9px] text-[#a08fd4] mt-0.5">
                                  {isFull ? 'Team Full' : `${spacesLeft} left`}
                                </span>
                              </div>
                              {!isDisabled && <ChevronRight className="w-4 h-4 text-[#f9c74f]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-3 flex items-center justify-end border-t-2 border-[#4b2f7e]">
                      <button
                        type="button"
                        onClick={() => setJoinHackathon(null)}
                        className="pixel-btn-secondary text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              const selectedAccepted = (selectedTeam.members || []).length;
              const selectedSpacesLeft = Math.max(0, selectedTeam.maxSize - selectedAccepted);
              const isSelectedOwnTeam = isMyCaptainTeam(selectedTeam);

              return (
                <form onSubmit={handleJoinTeamSubmit} className="space-y-4 text-xs">
                  {/* Selected Team Summary Banner */}
                  <div className="p-3 bg-[#f9c74f]/10 border-2 border-[#f9c74f] flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#f9c74f] text-[#1a1030]">
                          Selected Team
                        </span>
                        <span className="font-bold text-sm text-[#fff4d6]">{selectedTeam.teamName}</span>
                        <span className="text-[10px] font-bold text-[#52b788]">
                          ({selectedAccepted}/{selectedTeam.maxSize} · {selectedSpacesLeft} left)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#b9a7e8]">
                        Request will be sent directly to Captain{' '}
                        <strong className="text-[#f9c74f]">{selectedTeam.captainName}</strong>.
                      </p>
                    </div>

                    {availableTeams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setJoinStep('SELECT_TEAM')}
                        className="px-2.5 py-1.5 bg-[#241548] hover:bg-[#311d61] border border-[#f9c74f]/70 text-[10px] font-bold text-[#f9c74f] flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Change Team</span>
                      </button>
                    )}
                  </div>

                  {isSelectedOwnTeam && (
                    <div className="p-2.5 bg-[#d34c53]/20 border border-[#d34c53] text-[11px] text-[#fff4d6]">
                      You are the captain of this team. Pick another team to request to join.
                    </div>
                  )}

                  {!isSelectedOwnTeam && selectedSpacesLeft === 0 && (
                    <div className="p-2.5 bg-[#d34c53]/20 border border-[#d34c53] text-[11px] text-[#fff4d6]">
                      This team is already full ({selectedAccepted}/{selectedTeam.maxSize}). Please select another team or create a new one.
                    </div>
                  )}

                  {/* Applicant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                        Your Name <span className="text-[#f47b5c]">*</span>
                      </label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Rohan Sharma"
                        required
                        className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                        Roll Number <span className="text-[#f47b5c]">*</span>
                      </label>
                      <input
                        type="text"
                        value={applicantRoll}
                        onChange={(e) => setApplicantRoll(e.target.value)}
                        placeholder="e.g. 24"
                        required
                        className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">
                      Your Role <span className="text-[#f47b5c]">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      {ROLE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setApplicantRole(preset)}
                          className={`px-2 py-1 text-[10px] font-bold border cursor-pointer ${
                            applicantRole === preset
                              ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8]'
                              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:border-[#f9c74f]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={applicantRole}
                      onChange={(e) => setApplicantRole(e.target.value)}
                      placeholder="e.g. Developer, Designer, Researcher..."
                      required
                      className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-[#4b2f7e]">
                    {availableTeams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setJoinStep('SELECT_TEAM')}
                        className="pixel-btn-secondary text-xs mr-auto flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setJoinHackathon(null)}
                      className="pixel-btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSelectedOwnTeam || selectedSpacesLeft === 0}
                      className="pixel-btn text-xs flex items-center gap-1.5 disabled:opacity-45"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request to Join</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: TEAM MEMBERS ROSTER (Captain at Top + Teammates Details)
      ==================================================================== */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060410]/85 backdrop-blur-md font-mono">
          <div className="border-2 border-[#f4e6c8] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-[#4b2f7e]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                    {viewingTeam.teamName}
                  </h3>
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-[#2d6a4f]/30 border border-[#52b788] text-[#52b788]">
                    {(viewingTeam.members || []).length}/{viewingTeam.maxSize} Members
                  </span>
                </div>
                <p className="text-[11px] text-[#b9a7e8] mt-1 truncate">
                  Event: <strong className="text-[#f4e6c8]">{viewingTeam.hackathonTitle}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTeamId(null)}
                className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Top of List: Team Captain */}
              <div className="p-3.5 bg-[#f9c74f]/10 border-2 border-[#f9c74f] space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase bg-[#f9c74f] text-[#1a1030]">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Team Captain</span>
                  </span>
                  {viewingTeam.captainRoll && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1a1030] border border-[#f9c74f]/60 text-[#f9c74f]">
                      Roll #{viewingTeam.captainRoll}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-[#fff4d6]">{viewingTeam.captainName}</div>
                <div className="text-[11px] text-[#b9a7e8]">
                  Title: <strong className="text-[#f9c74f]">Team Captain</strong>
                  {viewingTeam.captainRoll ? ` · Roll Number: ${viewingTeam.captainRoll}` : ''}
                </div>
              </div>

              {/* Teammates List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#a08fd4]">
                  <span>Accepted Teammates ({(viewingTeam.members || []).length})</span>
                  <span>
                    {Math.max(0, viewingTeam.maxSize - (viewingTeam.members || []).length)} spaces left
                  </span>
                </div>

                {(viewingTeam.members || []).length === 0 ? (
                  <div className="p-4 bg-[#1a1030] border border-[#4b2f7e] text-center text-[11px] text-[#a08fd4]">
                    No teammates have joined this team yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(viewingTeam.members || []).map((member, index) => (
                      <div
                        key={member.id}
                        className="p-3 bg-[#1a1030] border border-[#4b2f7e] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#241548] border border-[#4b2f7e] text-[#a08fd4]">
                              #{index + 1}
                            </span>
                            <span className="font-bold text-[#fff4d6] text-xs">{member.name}</span>
                          </div>
                          <div className="text-[11px] text-[#b9a7e8]">
                            Role: <strong className="text-[#f9c74f]">{member.role}</strong> · Roll Number:{' '}
                            <strong className="text-[#52b788]">#{member.rollNumber}</strong>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#2d6a4f]/30 border border-[#52b788] text-[#52b788] shrink-0">
                          MEMBER
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-[#4b2f7e]">
              {!isMyCaptainTeam(viewingTeam) &&
                (viewingTeam.members || []).length < viewingTeam.maxSize && (
                  <button
                    type="button"
                    onClick={() => {
                      const parentHack = hackathons.find((h) => h.id === viewingTeam.hackathonId);
                      const targetId = viewingTeam.id;
                      setViewingTeamId(null);
                      if (parentHack) {
                        openJoinTeamModal(parentHack, targetId);
                      }
                    }}
                    className="pixel-btn text-xs flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Request to Join</span>
                  </button>
                )}
              <button
                type="button"
                onClick={() => setViewingTeamId(null)}
                className="pixel-btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: VERIFIED ITADDA MEMBER REQUIRED POP-UP
      ==================================================================== */}
      {authGatePrompt && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-[#060410]/85 backdrop-blur-md font-mono animate-in fade-in">
          <div className="border-2 border-[#f47b5c] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-md space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-[#4b2f7e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d34c53] text-white border-2 border-[#f4e6c8] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#d34c53]/25 text-[#f47b5c] border border-[#d34c53]">
                    Verified Member Only
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#f9c74f] mt-1 uppercase tracking-wider">
                    Verification Required
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthGatePrompt(null)}
                className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#f4e6c8] leading-relaxed">
                Only a <strong className="text-[#52b788]">verified member</strong> on the ITadda platform can{' '}
                {authGatePrompt.action === 'CREATE_TEAM' ? 'create a team' : 'request to join a particular team'}.
              </p>

              <div className="p-3.5 bg-[#1a1030] border-2 border-[#4b2f7e]">
                <p className="text-[#fff4d6] font-bold leading-relaxed">
                  First, register yourself on IT Adda, then create a team or join a team.
                </p>
              </div>

              {currentUser && currentUser.status !== 'APPROVED' && (
                <div className="p-3 bg-[#d97706]/20 border border-[#f9c74f] text-[11px] text-[#fff4d6]">
                  {currentUser.status === 'PENDING_APPROVAL'
                    ? `Your account (${currentUser.name}) is currently pending Admin verification. Once approved, log in to continue.`
                    : `Your account (${currentUser.name}) is currently not verified on ITadda.`}
                </div>
              )}
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-end gap-2 border-t-2 border-[#4b2f7e]">
              <button
                type="button"
                onClick={() => setAuthGatePrompt(null)}
                className="pixel-btn-secondary text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthGatePrompt(null);
                  setRegisterModalTab('SIGNIN');
                  setIsRegisterModalOpen(true);
                }}
                className="pixel-btn-secondary text-xs flex items-center gap-1.5 border-[#52b788]! text-[#52b788]!"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthGatePrompt(null);
                  setRegisterModalTab('REGISTER');
                  setIsRegisterModalOpen(true);
                }}
                className="pixel-btn text-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
