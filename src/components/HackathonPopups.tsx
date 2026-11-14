import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Sparkles,
  X,
} from 'lucide-react';

export const HackathonPopups: React.FC = () => {
  const {
    hackathonTeams,
    respondToJoinRequest,
    dismissTeamNotification,
    isMyCaptainTeam,
    isMyJoinRequest,
  } = useApp();

  // Session snoozed captain requests (only for current session if captain taps "Decide Later")
  const [snoozedRequestIds, setSnoozedRequestIds] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // 1. Captain Pending Requests (fires automatically for Team Captain!)
  const captainPendingQueue = useMemo(() => {
    const items: Array<{
      teamId: string;
      teamName: string;
      hackathonTitle: string;
      captainName: string;
      acceptedCount: number;
      maxSize: number;
      request: (typeof hackathonTeams)[number]['joinRequests'][number];
    }> = [];

    for (const team of hackathonTeams) {
      if (!isMyCaptainTeam(team)) continue;
      for (const req of team.joinRequests || []) {
        if (req.status === 'PENDING' && !snoozedRequestIds.includes(req.id)) {
          items.push({
            teamId: team.id,
            teamName: team.teamName,
            hackathonTitle: team.hackathonTitle,
            captainName: team.captainName,
            acceptedCount: (team.members || []).length,
            maxSize: team.maxSize,
            request: req,
          });
        }
      }
    }
    return items;
  }, [hackathonTeams, isMyCaptainTeam, snoozedRequestIds]);

  // 2. Applicant Denial Notifications (fires automatically whenever denied applicant opens platform!)
  const applicantDenialQueue = useMemo(() => {
    const items: Array<{
      teamId: string;
      teamName: string;
      hackathonTitle: string;
      captainName: string;
      request: (typeof hackathonTeams)[number]['joinRequests'][number];
    }> = [];

    for (const team of hackathonTeams) {
      for (const req of team.joinRequests || []) {
        if (
          isMyJoinRequest(req) &&
          req.status === 'DENIED' &&
          !req.denialDismissed
        ) {
          items.push({
            teamId: team.id,
            teamName: team.teamName,
            hackathonTitle: team.hackathonTitle,
            captainName: team.captainName,
            request: req,
          });
        }
      }
    }
    return items;
  }, [hackathonTeams, isMyJoinRequest]);

  // 3. Applicant Acceptance Notifications
  const applicantAcceptedQueue = useMemo(() => {
    const items: Array<{
      teamId: string;
      teamName: string;
      hackathonTitle: string;
      captainName: string;
      acceptedCount: number;
      maxSize: number;
      request: (typeof hackathonTeams)[number]['joinRequests'][number];
    }> = [];

    for (const team of hackathonTeams) {
      for (const req of team.joinRequests || []) {
        if (
          isMyJoinRequest(req) &&
          req.status === 'ACCEPTED' &&
          !req.acceptanceDismissed
        ) {
          items.push({
            teamId: team.id,
            teamName: team.teamName,
            hackathonTitle: team.hackathonTitle,
            captainName: team.captainName,
            acceptedCount: (team.members || []).length,
            maxSize: team.maxSize,
            request: req,
          });
        }
      }
    }
    return items;
  }, [hackathonTeams, isMyJoinRequest]);

  const activeCaptainItem = captainPendingQueue[0];
  const activeDenialItem = !activeCaptainItem ? applicantDenialQueue[0] : undefined;
  const activeAcceptedItem =
    !activeCaptainItem && !activeDenialItem ? applicantAcceptedQueue[0] : undefined;

  if (!activeCaptainItem && !activeDenialItem && !activeAcceptedItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#060410]/85 backdrop-blur-md font-mono animate-in fade-in">
      {/* CAPTAIN JOIN REQUEST POP-UP */}
      {activeCaptainItem && (
        <div className="border-2 border-[#f9c74f] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-md space-y-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-[#4b2f7e]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8] flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#f47b5c] text-[#1a1030]">
                  Captain Request ({captainPendingQueue.length} pending)
                </span>
                <h3 className="text-sm font-bold text-[#fff4d6] mt-1">
                  New Member Wants to Join!
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setSnoozedRequestIds((prev) => [...prev, activeCaptainItem.request.id])
              }
              className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer"
              title="Decide later"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 bg-[#1a1030] border-2 border-[#4b2f7e] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#a08fd4]">Team:</span>
              <span className="font-bold text-[#f9c74f]">
                {activeCaptainItem.teamName} ({activeCaptainItem.acceptedCount}/{activeCaptainItem.maxSize})
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#a08fd4]">Hackathon:</span>
              <span className="font-bold text-[#f4e6c8] text-right truncate max-w-[230px]">
                {activeCaptainItem.hackathonTitle}
              </span>
            </div>
            <div className="pt-2 border-t border-[#4b2f7e]/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#a08fd4]">Applicant:</span>
                <span className="font-bold text-white">{activeCaptainItem.request.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a08fd4]">Role:</span>
                <span className="font-bold text-[#52b788]">{activeCaptainItem.request.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a08fd4]">Roll Number:</span>
                <span className="font-bold text-[#f47b5c]">#{activeCaptainItem.request.rollNumber}</span>
              </div>
            </div>
          </div>

          {actionFeedback && (
            <div className="p-2 bg-[#d34c53]/20 border border-[#d34c53] text-[11px] text-[#fff4d6]">
              {actionFeedback}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={async () => {
                setActionFeedback(null);
                const res = await respondToJoinRequest(
                  activeCaptainItem.teamId,
                  activeCaptainItem.request.id,
                  'DENIED'
                );
                if (!res.success) setActionFeedback(res.message);
              }}
              className="pixel-btn-crimson text-xs py-2! flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Deny Request</span>
            </button>

            <button
              type="button"
              disabled={activeCaptainItem.acceptedCount >= activeCaptainItem.maxSize}
              onClick={async () => {
                setActionFeedback(null);
                const res = await respondToJoinRequest(
                  activeCaptainItem.teamId,
                  activeCaptainItem.request.id,
                  'ACCEPTED'
                );
                if (!res.success) setActionFeedback(res.message);
              }}
              className="pixel-btn text-xs py-2! flex items-center justify-center gap-1.5 disabled:opacity-45"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Member</span>
            </button>
          </div>
        </div>
      )}

      {/* APPLICANT DENIAL POP-UP */}
      {activeDenialItem && (
        <div className="border-2 border-[#d34c53] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-md space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b-2 border-[#4b2f7e]">
            <div className="w-10 h-10 bg-[#d34c53] text-white border border-[#f4e6c8] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#d34c53]/30 text-[#f47b5c] border border-[#d34c53]">
                Team Application Update
              </span>
              <h3 className="text-base font-bold text-[#fff4d6] mt-1">
                Request Denied by Team Captain
              </h3>
            </div>
          </div>

          <div className="p-3.5 bg-[#1a1030] border-2 border-[#d34c53]/60 text-xs space-y-2 leading-relaxed">
            <p className="text-[#f4e6c8]">
              Your request / application to join team{' '}
              <strong className="text-[#f9c74f]">{activeDenialItem.teamName}</strong> for{' '}
              <strong className="text-white">{activeDenialItem.hackathonTitle}</strong> was denied by team captain{' '}
              <strong className="text-[#f47b5c]">{activeDenialItem.captainName}</strong>.
            </p>
            <p className="text-[11px] text-[#a08fd4]">
              Submitted as: {activeDenialItem.request.name} ({activeDenialItem.request.role}, Roll #{activeDenialItem.request.rollNumber})
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                dismissTeamNotification(
                  activeDenialItem.teamId,
                  activeDenialItem.request.id,
                  'DENIED'
                )
              }
              className="pixel-btn text-xs"
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}

      {/* APPLICANT ACCEPTED POP-UP */}
      {activeAcceptedItem && (
        <div className="border-2 border-[#52b788] bg-[#150c28]/95 p-5 sm:p-6 shadow-[8px_8px_0_#060410] w-full max-w-md space-y-4">
          <div className="flex items-start gap-3 pb-3 border-b-2 border-[#4b2f7e]">
            <div className="w-10 h-10 bg-[#52b788] text-[#1a1030] border border-[#f4e6c8] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#2d6a4f]/40 text-[#52b788] border border-[#52b788]">
                Accepted into Team!
              </span>
              <h3 className="text-base font-bold text-[#fff4d6] mt-1">
                Welcome to {activeAcceptedItem.teamName}!
              </h3>
            </div>
          </div>

          <div className="p-3.5 bg-[#1a1030] border-2 border-[#52b788]/60 text-xs space-y-2 leading-relaxed">
            <p className="text-[#f4e6c8]">
              Team captain <strong className="text-[#f9c74f]">{activeAcceptedItem.captainName}</strong> accepted your request for{' '}
              <strong className="text-white">{activeAcceptedItem.hackathonTitle}</strong>!
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#52b788] font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>
                Team Strength: {activeAcceptedItem.acceptedCount}/{activeAcceptedItem.maxSize}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                dismissTeamNotification(
                  activeAcceptedItem.teamId,
                  activeAcceptedItem.request.id,
                  'ACCEPTED'
                )
              }
              className="pixel-btn text-xs"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
