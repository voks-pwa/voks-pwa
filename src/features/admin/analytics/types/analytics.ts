export interface AnalyticsTotals {
  users: number;
  transactions: number;
  missions: number;
  redemptions: number;
  currentListeners: number;
  totalListenedMinutes: number;
  avgListeningMinutes: number;
  peakToday: number;
  totalBroadcasts: number;
  pendingBroadcasts: number;
  sentBroadcasts: number;
  totalNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  uniqueMissionCompleters: number;
  uniqueRedeemers: number;
  podcastCount: number;
  promoCount: number;
}

export interface AnalyticsTrends {
  users: Record<string, number>;
  xp: Record<string, number>;
  missions: Record<string, number>;
  redemptions: Record<string, number>;
}

export interface AzuraCastData {
  listeners: {
    ip: string;
    userAgent: string;
    connectedSeconds: number;
    connectedAt: string;
  }[];
  uniqueCount: number;
  totalConnectedSeconds: number;
  error: string | null;
}

export interface NowPlayingData {
  isLive: boolean;
  streamerName: string;
  songTitle: string;
  songArtist: string;
  bitrate: number;
  listeners: number;
}

export interface AnalyticsResponse {
  totals: AnalyticsTotals;
  trends: AnalyticsTrends;
  azuracast: AzuraCastData;
  demographics: {
    cities: Record<string, number>;
    provinces: Record<string, number>;
    genders: Record<string, number>;
  };
  wordpress: {
    podcastCount: number;
    promoCount: number;
  };
  broadcasts: {
    total: number;
    sent: number;
    pending: number;
  };
  notifications: {
    total: number;
    read: number;
    unread: number;
  };
  rewardBreakdown: Record<string, number>;
  missionBreakdown: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  platforms: Record<string, number>;
  countries: Record<string, number>;
  listenerSources: Record<string, number>;
  nowplaying: NowPlayingData | null;
  broadcastTrend: Record<string, { sent: number; pending: number }>;
  listenerTrend: Record<string, number>;
  days: number;
}

export interface BroadcastTrendPoint {
  date: string;
  sent: number;
  pending: number;
}

export interface ListenerTrendPoint {
  date: string;
  listeners: number;
}

export interface ChartDataPoint {
  date: string;
  users: number;
  missions: number;
  redemptions: number;
  xp: number;
}
