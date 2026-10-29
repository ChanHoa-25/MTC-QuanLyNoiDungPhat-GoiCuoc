// Thuật toán kiểm tra xung đột / trùng lịch phát bản tin theo USR-BRD-02 (SRS Trang 14-15)
import type { Broadcast, Device } from '../types';

export interface ScheduleConflictCheckInput {
  title: string;
  type: 'regular' | 'priority';
  targetMode: 'facility' | 'device';
  targetIds: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  repeatDays: number[]; // [0,1,2,3,4,5,6]
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictBroadcasts: {
    broadcast: Broadcast;
    conflictedDeviceNames: string[];
    conflictedFacilityName?: string;
    reason: string;
    willBeOverridden?: boolean; // Nếu bản tin mới là Ưu tiên, bản tin cũ sẽ bị ghi đè
  }[];
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function datesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return !(endA < startB || startA > endB);
}

function timesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

function daysOverlap(daysA: number[], daysB: number[]): boolean {
  return daysA.some((d) => daysB.includes(d));
}

export function checkBroadcastConflicts(
  input: ScheduleConflictCheckInput,
  existingBroadcasts: Broadcast[],
  allDevices: Device[],
  facilityNamesMap: Record<string, string>,
  excludeBroadcastId?: string
): ConflictResult {
  const activeExisting = existingBroadcasts.filter(
    (b) =>
      b.id !== excludeBroadcastId &&
      ['scheduled', 'upcoming', 'broadcasting', 'waiting'].includes(b.status)
  );

  const conflicts: ConflictResult['conflictBroadcasts'] = [];

  // Xác định danh sách thiết bị bị ảnh hưởng bởi bản tin mới
  let targetDeviceIds: string[] = [];
  if (input.targetMode === 'device') {
    targetDeviceIds = input.targetIds;
  } else {
    // Mode là cơ sở -> lấy tất cả thiết bị thuộc các cơ sở này
    targetDeviceIds = allDevices
      .filter((d) => input.targetIds.includes(d.facilityId))
      .map((d) => d.id);
  }

  for (const existing of activeExisting) {
    // Kiểm tra giao khoảng ngày
    if (!datesOverlap(input.startDate, input.endDate, existing.startDate, existing.endDate)) {
      continue;
    }

    // Kiểm tra các thứ trong tuần
    if (!daysOverlap(input.repeatDays, existing.repeatDays)) {
      continue;
    }

    // Kiểm tra khung giờ trong ngày
    if (!timesOverlap(input.startTime, input.endTime, existing.startTime, existing.endTime)) {
      continue;
    }

    // Xác định danh sách thiết bị của bản tin cũ
    let existingDeviceIds: string[] = [];
    if (existing.targetMode === 'device') {
      existingDeviceIds = existing.targetIds;
    } else {
      existingDeviceIds = allDevices
        .filter((d) => existing.targetIds.includes(d.facilityId))
        .map((d) => d.id);
    }

    // Tìm điểm giao thiết bị
    const intersectedDeviceIds = targetDeviceIds.filter((id) => existingDeviceIds.includes(id));

    if (intersectedDeviceIds.length > 0) {
      const conflictedDeviceNames = allDevices
        .filter((d) => intersectedDeviceIds.includes(d.id))
        .map((d) => `${d.name} (${d.deviceCode})`);

      const willBeOverridden = input.type === 'priority';

      let reason = '';
      if (input.targetMode === 'facility') {
        const facName = input.targetIds.map((fId) => facilityNamesMap[fId] || fId).join(', ');
        reason = `Cơ sở [${facName}] có ${intersectedDeviceIds.length} thiết bị trùng khung giờ (${existing.startTime} - ${existing.endTime}) với bản tin "${existing.title}".`;
      } else {
        reason = `Trùng giờ phát (${existing.startTime} - ${existing.endTime}) trên thiết bị với bản tin "${existing.title}".`;
      }

      if (willBeOverridden) {
        reason += ' (Bản tin ưu tiên sẽ tự động đè lên lịch này)';
      }

      conflicts.push({
        broadcast: existing,
        conflictedDeviceNames,
        conflictedFacilityName:
          input.targetMode === 'facility'
            ? input.targetIds.map((fId) => facilityNamesMap[fId] || fId).join(', ')
            : undefined,
        reason,
        willBeOverridden,
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflictBroadcasts: conflicts,
  };
}
