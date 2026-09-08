import { useState, useEffect } from 'react';
import type { DeviceLiveStatus } from '@zentry/shared';
import { parentFirestoreService } from '../services/parentFirestore';

export const INITIAL_DEVICES: DeviceLiveStatus[] = [
  {
    deviceId: 'ipad_mateo_01',
    appName: 'skinner-box',
    isOnline: true,
    lastHeartbeat: Date.now() - 4000,
    activeSessionId: 'session_skinner_live_01',
  },
  {
    deviceId: 'phone_mateo_02',
    appName: 'isla-dinamica',
    isOnline: true,
    lastHeartbeat: Date.now() - 12000,
  },
  {
    deviceId: 'parent_cockpit_01',
    appName: 'parent-dashboard',
    isOnline: true,
    lastHeartbeat: Date.now(),
  },
];

export function useLiveDevices() {
  const [devices, setDevices] = useState<DeviceLiveStatus[]>(INITIAL_DEVICES);

  useEffect(() => {
    INITIAL_DEVICES.forEach((d) => parentFirestoreService.sendHeartbeat(d));

    // Send heartbeat for dashboard
    const heartbeatTimer = setInterval(() => {
      parentFirestoreService.sendHeartbeat({
        deviceId: 'parent_cockpit_01',
        appName: 'parent-dashboard',
        isOnline: true,
        lastHeartbeat: Date.now(),
      });
    }, 10000);

    const unsubscribe = parentFirestoreService.subscribeDevices((deviceList) => {
      if (deviceList && deviceList.length > 0) {
        setDevices(deviceList);
      }
    });

    return () => {
      clearInterval(heartbeatTimer);
      unsubscribe();
    };
  }, []);

  const childDevice = devices.find((d) => d.deviceId.includes('mateo') || d.appName === 'skinner-box') || devices[0];
  const isChildOnline = childDevice ? (Date.now() - childDevice.lastHeartbeat) < 20000 : false;

  return {
    devices,
    childDevice,
    isChildOnline,
  };
}
