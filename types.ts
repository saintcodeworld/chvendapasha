
export interface MiningStats {
  hashRate: number;
  totalHashes: number;
  acceptedShares: number;
  pendingXMR: number;
  pendingSOL: number;
  uptime: number;
  solves: number;
}

export interface PayoutRecord {
  id: string;
  timestamp: number;
  amountSOL: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  address: string;
}

export enum CaptchaDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum MinerStatus {
  IDLE = 'idle',
  MINING = 'mining', // Captcha mode active
  TAB_MINING = 'tab_mining', // Automatic mode active
  DUAL_MINING = 'dual_mining', // Both active
  COOLDOWN = 'cooldown',
  THROTTLED = 'throttled',
  ERROR = 'error'
}

export interface MinerConfig {
  threads: number;
  throttle: number;
  payoutAddress: string;
}
