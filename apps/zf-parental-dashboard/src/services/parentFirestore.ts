import {
  publishSkinnerSession,
  subscribeToLatestSkinnerSession,
  subscribeToSkinnerSession,
  subscribeToSkinnerLeverEvents,
  subscribeToLatestSkinnerSessionReport,
  subscribeToSkinnerSessionReports,
  saveSkinnerSessionReport,
  recordIslandTelemetry,
  subscribeToIslandTelemetry,
  sendDeviceHeartbeat,
  subscribeToActiveDevices,
  saveDocument as sharedSaveDocument,
  deleteDocument as sharedDeleteDocument,
  subscribeToDocuments as sharedSubscribeToDocuments,
  getFirestoreDb,
  localDataBus,
  checkIsFirebaseOnline,
  sendSkinnerCommand,
  subscribeToSkinnerCommands,
  saveCreativeCreation as sharedSaveCreativeCreation,
  subscribeToCreativeCreations as sharedSubscribeToCreativeCreations,
} from '@zentry/shared';
import type {
  SkinnerSessionRecord,
  IslandTelemetryEvent,
  DeviceLiveStatus,
  DocumentItem,
  SkinnerCommandType,
  SkinnerCommandEvent,
  SkinnerLeverEvent,
  SkinnerSessionReportRecord,
  CreativeCreationRecord,
} from '@zentry/shared';

export const parentFirestoreService = {
  // Master Skinner Control Methods
  sendMasterCommand: async (type: SkinnerCommandType, sessionId: string, targetProfile: 'child' | 'adult' = 'child') => {
    const cmd: SkinnerCommandEvent = {
      commandId: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      sessionId,
      targetProfile,
      timestamp: Date.now(),
    };
    return sendSkinnerCommand(cmd);
  },

  subscribeMasterCommands: (callback: (cmd: SkinnerCommandEvent) => void) => {
    return subscribeToSkinnerCommands(callback);
  },

  // Skinner Box Real-Time Methods
  subscribeLatestSkinner: (callback: (session: SkinnerSessionRecord | null) => void) => {
    return subscribeToLatestSkinnerSession(callback);
  },

  subscribeSkinnerSession: (sessionId: string, callback: (session: SkinnerSessionRecord | null) => void) => {
    return subscribeToSkinnerSession(sessionId, callback);
  },

  publishSkinnerUpdate: async (session: SkinnerSessionRecord) => {
    return publishSkinnerSession(session);
  },

  subscribeLeverEvents: (callback: (event: SkinnerLeverEvent) => void) => {
    return subscribeToSkinnerLeverEvents(callback);
  },

  subscribeLatestReport: (callback: (report: SkinnerSessionReportRecord | null) => void) => {
    return subscribeToLatestSkinnerSessionReport(callback);
  },

  subscribeSessionReport: (sessionId: string, callback: (report: SkinnerSessionReportRecord | null) => void) => {
    return subscribeToSkinnerSessionReports(sessionId, callback);
  },

  saveSessionReport: async (report: SkinnerSessionReportRecord) => {
    return saveSkinnerSessionReport(report);
  },

  // Isla Dinamica Real-Time Methods
  subscribeIslandTelemetry: (callback: (events: IslandTelemetryEvent[]) => void, limitCount = 30) => {
    return subscribeToIslandTelemetry(callback, limitCount);
  },

  publishIslandEvent: async (event: IslandTelemetryEvent) => {
    return recordIslandTelemetry(event);
  },

  // Device Status Methods
  subscribeDevices: (callback: (devices: DeviceLiveStatus[]) => void) => {
    return subscribeToActiveDevices(callback);
  },

  sendHeartbeat: async (status: DeviceLiveStatus) => {
    return sendDeviceHeartbeat(status);
  },

  // Family Document Vault Methods
  subscribeVaultDocuments: (callback: (docs: DocumentItem[]) => void) => {
    return sharedSubscribeToDocuments(callback);
  },

  saveVaultDocument: async (docItem: DocumentItem) => {
    return sharedSaveDocument(docItem);
  },

  deleteVaultDocument: async (docId: string) => {
    return sharedDeleteDocument(docId);
  },

  // Creative Studio (Z-Art WOW) Sync Methods
  subscribeCreativeCreations: (callback: (creations: CreativeCreationRecord[]) => void) => {
    return sharedSubscribeToCreativeCreations(callback);
  },

  saveCreativeCreation: async (creation: CreativeCreationRecord) => {
    return sharedSaveCreativeCreation(creation);
  },

  // System Diagnostics
  isCloudConnected: () => {
    return checkIsFirebaseOnline();
  },

  getDbInstance: () => {
    return getFirestoreDb();
  },
};
