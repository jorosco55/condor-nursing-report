# PowerSync Configuration & Schema Guideline

## Overview

This document outlines the PowerSync configuration required for backend synchronization of the Vighter Flight Nursing Report application.

## Database Schema

### Core Tables

```sql
-- Nursing Reports table
CREATE TABLE nursing_reports (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  site TEXT NOT NULL,
  ice_flight_rn TEXT NOT NULL,
  second_ice_flight_rn TEXT,
  tail_number TEXT NOT NULL,
  mission_number TEXT NOT NULL,
  site_stops TEXT,
  foic_title TEXT,
 aso_lead TEXT,
  preflight_meb_check INTEGER DEFAULT 0,
  preflight_mek_o2_aed INTEGER DEFAULT 0,
  safety_briefing_completed INTEGER DEFAULT 0,
  seat_belts_secured INTEGER DEFAULT 0,
  showtime_z1 TEXT,
  block_time_z1 TEXT,
  end_time_z1 TEXT,
  showtime_z2 TEXT,
  block_time_z2 TEXT,
  end_time_z2 TEXT,
  ron_used INTEGER DEFAULT 0,
  narc_record TEXT,
  rn_signature TEXT,
  date_signed TEXT,
  second_rn_signature TEXT,
  second_date_signed TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'pending'
);

-- Narrative Notes (child records)
CREATE TABLE narrative_notes (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  time_l TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'pending',
  FOREIGN KEY (report_id) REFERENCES nursing_reports(id)
);

-- Sync metadata
CREATE TABLE sync_metadata (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

## PowerSync Configuration

### powersync.ts

```typescript
import { PowerSyncDatabase } from '@powersync/react-native';
import { SQLiteAdapter } from '@powersync/sqlite';

export const powerSyncConfig = {
  database: {
    dbName: 'nursing_reports.db',
    schema: {
      version: 1,
      tables: [
        {
          name: 'nursing_reports',
          columns: [
            { name: 'id', type: 'text', primary: true },
            { name: 'date', type: 'text' },
            { name: 'site', type: 'text' },
            { name: 'ice_flight_rn', type: 'text' },
            { name: 'second_ice_flight_rn', type: 'text' },
            { name: 'tail_number', type: 'text' },
            { name: 'mission_number', type: 'text' },
            { name: 'site_stops', type: 'text' },
            { name: 'foic_title', type: 'text' },
            { name: 'aso_lead', type: 'text' },
            { name: 'preflight_meb_check', type: 'integer' },
            { name: 'preflight_mek_o2_aed', type: 'integer' },
            { name: 'safety_briefing_completed', type: 'integer' },
            { name: 'seat_belts_secured', type: 'integer' },
            { name: 'showtime_z1', type: 'text' },
            { name: 'block_time_z1', type: 'text' },
            { name: 'end_time_z1', type: 'text' },
            { name: 'showtime_z2', type: 'text' },
            { name: 'block_time_z2', type: 'text' },
            { name: 'end_time_z2', type: 'text' },
            { name: 'ron_used', type: 'integer' },
            { name: 'narc_record', type: 'text' },
            { name: 'rn_signature', type: 'text' },
            { name: 'date_signed', type: 'text' },
            { name: 'second_rn_signature', type: 'text' },
            { name: 'second_date_signed', type: 'text' },
            { name: 'created_at', type: 'text' },
            { name: 'updated_at', type: 'text' },
            { name: 'sync_status', type: 'text' },
          ],
        },
        {
          name: 'narrative_notes',
          columns: [
            { name: 'id', type: 'text', primary: true },
            { name: 'report_id', type: 'text' },
            { name: 'time_l', type: 'text' },
            { name: 'note', type: 'text' },
            { name: 'created_at', type: 'text' },
            { name: 'sync_status', type: 'text' },
          ],
        },
      ],
    },
  },
  sync: {
    endpoint: '${POWERSYNC_ENDPOINT}',
    token: '${POWERSYNC_TOKEN}',
    retryStrategy: {
      maxRetries: 3,
      backoffMs: 1000,
    },
  },
};

export const powerSyncDb = new PowerSyncDatabase(
  new SQLiteAdapter(powerSyncConfig.database)
);
```

## Sync Rules

### Remote to Local (Read)
- All approved/completed reports sync to device
- Filter by user permissions (nurse assignments)

### Local to Remote (Write)
- New reports queued with `sync_status = 'pending'`
- Sync triggered on save (online) or reconnect (offline)
- Batch processing for multiple pending records

### Conflict Resolution
- Last-write-wins for field-level conflicts
- Timestamp comparison: `updated_at` field determines winner

## Environment Variables

```env
POWERSYNC_ENDPOINT=https://api.vighter.com/powersync
POWERSYNC_TOKEN=your-service-token-here
```

## Implementation Notes

1. **Phase 1 (Online):** Full API sync - no local storage for production data
2. **Phase 2 (Offline Read):** PowerSync integrates with Supabase or custom backend
3. Signature images stored as Base64 strings in `rn_signature` / `second_rn_signature` fields

## Backend Requirements

The backend must provide:
- PowerSync-compatible sync endpoint
- JWT authentication
- Row-level security (RLS) policies
- WebSocket or polling for real-time updates (optional)
