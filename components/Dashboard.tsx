
import React from 'react';


import MinerControls from './MinerControls';
import LiveChat from './LiveChat';
import CaptchaChallenge from './CaptchaChallenge';
import TransactionHistory from './TransactionHistory';
import RedeemCode from './RedeemCode';
import { MinerStatus, MiningStats, MinerConfig, PayoutRecord, CaptchaDifficulty } from '../types';

interface DashboardProps {
  status: MinerStatus;
  stats: MiningStats;
  config: MinerConfig;
  history: PayoutRecord[];
  onToggle: () => void;
  onToggleTab: () => void;
  onConfigChange: (config: MinerConfig) => void;
  onVerify: (solution: string, expected: string) => Promise<{ success: boolean; error?: string }>;
  onSuccess: (difficulty: CaptchaDifficulty) => void;
  onMilestone: (distance: number) => void;

  onRequestWithdrawal: () => Promise<{ success: boolean; error?: string; txHash?: string }>;
  onRedeemSuccess: (amount: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  status, stats, config, history, onToggle, onToggleTab, onConfigChange, onVerify, onSuccess, onMilestone, onRequestWithdrawal, onRedeemSuccess
}) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Left Sidebar - Portfolio & History */}
      <aside className="w-full xl:w-80 flex flex-col gap-4 order-2 xl:order-1">

        <TransactionHistory history={history} />
        <RedeemCode userAddress={config.payoutAddress} onRedeemSuccess={onRedeemSuccess} />
      </aside>

      {/* Main Center Content - Game Window */}
      <main className="flex-1 flex flex-col gap-6 order-1 xl:order-2">


        <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500">
          <CaptchaChallenge
            onVerify={onVerify}
            onSuccess={onSuccess}
            onStart={onToggle}
            onMilestone={onMilestone}
            isMining={status === MinerStatus.MINING || status === MinerStatus.DUAL_MINING}
          />
        </div>
      </main>

      {/* Right Sidebar - Withdrawal & Chat */}
      <aside className="w-full xl:w-96 order-3 flex flex-col gap-6">
        <MinerControls
          status={status}
          config={config}
          onToggle={onToggle}
          onToggleTab={onToggleTab}
          onConfigChange={onConfigChange}
          onVerify={onVerify}
          onSuccess={onSuccess}
          currentBalance={stats.pendingSOL}
          onRequestWithdrawal={onRequestWithdrawal}
        />
        <LiveChat userAddress={config.payoutAddress} />
      </aside>
    </div>
  );
};

export default Dashboard;
