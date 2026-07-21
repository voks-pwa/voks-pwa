export interface SystemHealth {
  success: boolean;
  status: "healthy" | "degraded" | "error";
  timestamp: string;
  database: {
    connected: boolean;
    response_time_ms: number;
    tables: Record<string, number>;
  };
  wordpress: {
    connected: boolean;
    response_time_ms: number;
    error: string | null;
  };
  app: {
    version: string;
    build_number: string;
    build_date: string | null;
  };
  maintenance_mode: {
    enabled: boolean;
    message: string;
  };
  checks: {
    database: boolean;
    wordpress_api: boolean;
  };
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SystemConfig {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
}

export interface AppVersion {
  version: string;
  build_number: string;
  build_date: string | null;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  created_at: string;
}
