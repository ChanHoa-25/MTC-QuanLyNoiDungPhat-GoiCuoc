import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Organization,
  Facility,
  Device,
  MediaItem,
  TemplateItem,
  PlaylistItem,
  Broadcast,
  ServicePackage,
  UpgradePackage,
  SystemNotification,
  ActivityLog,
  DeviceErrorDefinition,
  PackageTransaction,
} from '../types';
import {
  INITIAL_ORGS,
  INITIAL_FACILITIES,
  INITIAL_DEVICES,
  INITIAL_MEDIA,
  INITIAL_TEMPLATES,
  INITIAL_PLAYLISTS,
  INITIAL_BROADCASTS,
  INITIAL_PACKAGES,
  INITIAL_UPGRADE_PACKAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ERROR_DEFINITIONS,
} from '../data/mockData';
import { calculatePackageSwitch, type PackageSwitchResult } from '../utils/packageCalculator';

interface MtcDataContextType {
  // Organizations
  organizations: Organization[];
  addOrganization: (org: Omit<Organization, 'id'>) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  deleteOrganization: (id: string) => { success: boolean; message: string };
  renewOrganizationPackage: (orgId: string) => void;
  cancelAutoRenew: (orgId: string) => void;
  switchOrganizationPackage: (
    orgId: string,
    newPackageId: string,
    usedDays: number
  ) => { result: PackageSwitchResult; success: boolean };

  // Facilities
  facilities: Facility[];
  addFacility: (facility: Omit<Facility, 'id'>) => void;
  updateFacility: (id: string, data: Partial<Facility>) => void;
  deleteFacility: (id: string) => { success: boolean; message: string };

  // Devices
  devices: Device[];
  addDevice: (device: Omit<Device, 'id'>) => void;
  updateDevice: (id: string, data: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  setDevicesVolume: (deviceIds: string[], volume: number) => void;
  restartDevice: (deviceId: string) => void;
  generateDeviceLoginCode: (deviceId: string) => { qrUrl: string; code: string };

  // Media
  mediaList: MediaItem[];
  addMedia: (media: Omit<MediaItem, 'id'>) => void;
  updateMedia: (id: string, data: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => { success: boolean; message: string };
  approveMedia: (id: string, approverName: string) => void;
  rejectMedia: (id: string, reason: string, approverName: string) => void;
  shareMediaToFacility: (mediaId: string, targetFacilityId: string) => void;

  // Templates & Playlists
  templates: TemplateItem[];
  addTemplate: (tpl: Omit<TemplateItem, 'id' | 'isUsed' | 'createdAt'>) => void;
  deleteTemplate: (id: string) => { success: boolean; message: string };
  playlists: PlaylistItem[];
  addPlaylist: (pls: Omit<PlaylistItem, 'id' | 'isUsed' | 'createdAt'>) => void;
  deletePlaylist: (id: string) => { success: boolean; message: string };

  // Broadcasts
  broadcasts: Broadcast[];
  addBroadcast: (broadcast: Omit<Broadcast, 'id' | 'createdAt'>) => void;
  updateBroadcastStatus: (id: string, status: Broadcast['status']) => void;
  approveBroadcast: (id: string, approverName: string) => void;
  rejectBroadcast: (id: string, reason: string, approverName: string) => void;
  deleteBroadcast: (id: string) => { success: boolean; message: string };

  // Packages
  packages: ServicePackage[];
  upgradePackages: UpgradePackage[];
  transactions: PackageTransaction[];
  addServicePackage: (pkg: Omit<ServicePackage, 'id'>) => void;
  updateServicePackage: (id: string, data: Partial<ServicePackage>) => void;
  deleteServicePackage: (id: string) => { success: boolean; message: string };
  addUpgradePackage: (upg: Omit<UpgradePackage, 'id' | 'purchasedCount'>) => void;
  buyUpgradePackage: (orgId: string, upgId: string) => void;

  // Notifications & Audit Logs
  notifications: SystemNotification[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (ntf: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  activityLogs: ActivityLog[];
  logAction: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // Error Definitions
  errorDefinitions: DeviceErrorDefinition[];
}

const MtcDataContext = createContext<MtcDataContextType | undefined>(undefined);

export const MtcDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('mtc_orgs');
    return saved ? JSON.parse(saved) : INITIAL_ORGS;
  });

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem('mtc_facilities');
    return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
  });

  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('mtc_devices');
    return saved ? JSON.parse(saved) : INITIAL_DEVICES;
  });

  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('mtc_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });

  const [templates, setTemplates] = useState<TemplateItem[]>(() => {
    const saved = localStorage.getItem('mtc_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [playlists, setPlaylists] = useState<PlaylistItem[]>(() => {
    const saved = localStorage.getItem('mtc_playlists');
    return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
  });

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(() => {
    const saved = localStorage.getItem('mtc_broadcasts');
    return saved ? JSON.parse(saved) : INITIAL_BROADCASTS;
  });

  const [packages, setPackages] = useState<ServicePackage[]>(() => {
    const saved = localStorage.getItem('mtc_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [upgradePackages, setUpgradePackages] = useState<UpgradePackage[]>(() => {
    const saved = localStorage.getItem('mtc_upgrade_packages');
    return saved ? JSON.parse(saved) : INITIAL_UPGRADE_PACKAGES;
  });

  const [transactions, setTransactions] = useState<PackageTransaction[]>(() => {
    const saved = localStorage.getItem('mtc_transactions');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'txn-01',
            orgId: 'org-alta',
            orgName: 'Tổng Công Ty Truyền Thông Alta Media',
            packageName: 'Gói Doanh Nghiệp 100GB / 1 Năm',
            amountVND: 4800000,
            type: 'buy',
            status: 'success',
            createdAt: '2026-01-01T09:00:00Z',
          },
          {
            id: 'txn-02',
            orgId: 'org-vin',
            orgName: 'Ban Quản Lý Chuỗi Đô Thị Vinhomes',
            packageName: 'Gói Chuyên Nghiệp 20GB / 6 Tháng',
            amountVND: 2700000,
            type: 'buy',
            status: 'success',
            createdAt: '2026-03-01T10:15:00Z',
          },
        ];
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('mtc_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('mtc_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('mtc_orgs', JSON.stringify(organizations));
  }, [organizations]);
  useEffect(() => {
    localStorage.setItem('mtc_facilities', JSON.stringify(facilities));
  }, [facilities]);
  useEffect(() => {
    localStorage.setItem('mtc_devices', JSON.stringify(devices));
  }, [devices]);
  useEffect(() => {
    localStorage.setItem('mtc_media', JSON.stringify(mediaList));
  }, [mediaList]);
  useEffect(() => {
    localStorage.setItem('mtc_templates', JSON.stringify(templates));
  }, [templates]);
  useEffect(() => {
    localStorage.setItem('mtc_playlists', JSON.stringify(playlists));
  }, [playlists]);
  useEffect(() => {
    localStorage.setItem('mtc_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);
  useEffect(() => {
    localStorage.setItem('mtc_packages', JSON.stringify(packages));
  }, [packages]);
  useEffect(() => {
    localStorage.setItem('mtc_upgrade_packages', JSON.stringify(upgradePackages));
  }, [upgradePackages]);
  useEffect(() => {
    localStorage.setItem('mtc_transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('mtc_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('mtc_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Logging Helper
  const logAction = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newEntry, ...prev]);
  };

  // Notifications Helper
  const addNotification = (ntf: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNtf: SystemNotification = {
      ...ntf,
      id: `ntf-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNtf, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Organizations Methods
  const addOrganization = (org: Omit<Organization, 'id'>) => {
    const newOrg: Organization = {
      ...org,
      id: `org-${Date.now()}`,
    };
    setOrganizations((prev) => [...prev, newOrg]);
    logAction({
      actorName: 'MTC Admin',
      actorRole: 'SystemAdmin',
      facilityName: 'Hệ thống',
      group: 'Cơ sở',
      action: 'Thêm tổ chức',
      identifier: `${newOrg.name} (${newOrg.orgCode})`,
      newValue: `Gói cước: ${newOrg.currentPackageId}`,
    });
  };

  const updateOrganization = (id: string, data: Partial<Organization>) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === id ? { ...org, ...data } : org))
    );
  };

  const deleteOrganization = (id: string): { success: boolean; message: string } => {
    const target = organizations.find((o) => o.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy tổ chức.' };
    // SRS SYS-ORG-06: Chỉ xóa được tổ chức ở trạng thái Hủy bỏ tổ chức
    if (target.status !== 'cancelled') {
      return {
        success: false,
        message: 'Chỉ xóa được tổ chức ở trạng thái "Hủy bỏ tổ chức" (hết hạn quá 30 ngày).',
      };
    }
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    logAction({
      actorName: 'MTC Admin',
      actorRole: 'SystemAdmin',
      facilityName: 'Hệ thống',
      group: 'Cơ sở',
      action: 'Xóa tổ chức',
      identifier: `${target.name} (${target.orgCode})`,
    });
    return { success: true, message: 'Đã xóa tổ chức khỏi danh sách (lịch sử thanh toán vẫn được bảo lưu).' };
  };

  const renewOrganizationPackage = (orgId: string) => {
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const currentExp = new Date(org.expiryDate);
          currentExp.setMonth(currentExp.getMonth() + 1);
          return {
            ...org,
            status: 'active',
            expiryDate: currentExp.toISOString().split('T')[0],
          };
        }
        return org;
      })
    );
  };

  const cancelAutoRenew = (orgId: string) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === orgId ? { ...org, autoRenew: false } : org))
    );
  };

  const switchOrganizationPackage = (
    orgId: string,
    newPackageId: string,
    usedDays: number
  ): { result: PackageSwitchResult; success: boolean } => {
    const org = organizations.find((o) => o.id === orgId);
    const oldPkg = packages.find((p) => p.id === org?.currentPackageId);
    const newPkg = packages.find((p) => p.id === newPackageId);

    if (!org || !oldPkg || !newPkg) {
      throw new Error('Dữ liệu gói hoặc tổ chức không hợp lệ');
    }

    const calcResult = calculatePackageSwitch({
      oldPrice: oldPkg.priceVND,
      oldTotalDays: oldPkg.durationMonths * 30,
      usedDays,
      newPrice: newPkg.priceVND,
      newTotalDays: newPkg.durationMonths * 30,
    });

    // Cập nhật tổ chức sang gói mới
    const startDate = new Date();
    const expiryDate = new Date();
    const extraDays = calcResult.compensationDays || 0;
    expiryDate.setDate(expiryDate.getDate() + newPkg.durationMonths * 30 + extraDays);

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
              ...o,
              currentPackageId: newPackageId,
              storageTotalMB: newPkg.storageGB * 1024,
              startDate: startDate.toISOString().split('T')[0],
              expiryDate: expiryDate.toISOString().split('T')[0],
              status: 'active',
            }
          : o
      )
    );

    // Ghi nhận lịch sử giao dịch
    const newTxn: PackageTransaction = {
      id: `txn-${Date.now()}`,
      orgId: org.id,
      orgName: org.name,
      packageName: newPkg.name,
      amountVND: calcResult.finalAmountToPay,
      type: 'switch',
      status: 'success',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTxn, ...prev]);

    return { result: calcResult, success: true };
  };

  // Facilities Methods
  const addFacility = (facility: Omit<Facility, 'id'>) => {
    const newFac: Facility = { ...facility, id: `fac-${Date.now()}` };
    setFacilities((prev) => [...prev, newFac]);
  };

  const updateFacility = (id: string, data: Partial<Facility>) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f))
    );
  };

  const deleteFacility = (id: string): { success: boolean; message: string } => {
    // SRS USR-FAC-05: Không được xóa cơ sở còn chứa media
    const hasMedia = mediaList.some((m) => m.facilityId === id);
    if (hasMedia) {
      return {
        success: false,
        message: 'Không thể xóa cơ sở vì vẫn còn chứa nguồn tin (Media). Vui lòng di chuyển hoặc xóa media trước.',
      };
    }
    const hasChild = facilities.some((f) => f.parentId === id);
    if (hasChild) {
      return {
        success: false,
        message: 'Không thể xóa cơ sở đang có cơ sở cấp con trực thuộc.',
      };
    }
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    return { success: true, message: 'Đã xóa cơ sở thành công.' };
  };

  // Devices Methods
  const addDevice = (device: Omit<Device, 'id'>) => {
    const newDev: Device = { ...device, id: `dev-${Date.now()}` };
    setDevices((prev) => [...prev, newDev]);
  };

  const updateDevice = (id: string, data: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
  };

  const deleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const setDevicesVolume = (deviceIds: string[], volume: number) => {
    setDevices((prev) =>
      prev.map((d) => (deviceIds.includes(d.id) ? { ...d, volume } : d))
    );
  };

  const restartDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, connectionStatus: 'online', broadcastStatus: 'idle' }
          : d
      )
    );
  };

  const generateDeviceLoginCode = (deviceId: string) => {
    const sixDigits = String(Math.floor(100000 + Math.random() * 900000));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MTC-DEVICE-${deviceId}-${sixDigits}`;
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, oneTimeLoginCode: sixDigits, loginCodeUsed: false }
          : d
      )
    );
    return { qrUrl, code: sixDigits };
  };

  // Media Methods
  const addMedia = (media: Omit<MediaItem, 'id'>) => {
    const newMedia: MediaItem = { ...media, id: `med-${Date.now()}` };
    setMediaList((prev) => [newMedia, ...prev]);
  };

  const updateMedia = (id: string, data: Partial<MediaItem>) => {
    setMediaList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
  };

  const deleteMedia = (id: string): { success: boolean; message: string } => {
    // SRS USR-MED-06: Không xóa media đang có bản tin sử dụng
    const isUsedInBroadcast = broadcasts.some(
      (b) => b.contentType === 'media' && b.contentId === id
    );
    if (isUsedInBroadcast) {
      return {
        success: false,
        message: 'Không thể xóa Media này vì đang được sử dụng trong bản tin phát sóng.',
      };
    }
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    return { success: true, message: 'Đã xóa nguồn tin thành công.' };
  };

  const approveMedia = (id: string, approverName: string) => {
    const media = mediaList.find((m) => m.id === id);
    if (media) {
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'approved' } : m))
      );
      addNotification({
        code: 'NTF-01',
        title: 'Nguồn tin đã được duyệt',
        content: `Media file [${media.title}] đã được phê duyệt bởi ${approverName}.`,
        recipientRole: 'Creator',
      });
      logAction({
        actorName: approverName,
        actorRole: 'Approver',
        facilityName: 'Cơ sở',
        group: 'Media file',
        action: 'Phê duyệt',
        identifier: media.title,
        oldValue: 'Chờ duyệt',
        newValue: 'Đã duyệt',
      });
    }
  };

  const rejectMedia = (id: string, reason: string, approverName: string) => {
    const media = mediaList.find((m) => m.id === id);
    if (media) {
      setMediaList((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: 'rejected',
                rejectionReason: reason.slice(0, 510),
                rejectedAt: new Date().toISOString(),
              }
            : m
        )
      );
      addNotification({
        code: 'NTF-03',
        title: 'Từ chối duyệt nguồn tin',
        content: `Media file [${media.title}] đã bị từ chối duyệt bởi ${approverName}. Lý do: ${reason}`,
        recipientRole: 'Creator',
      });
    }
  };

  const shareMediaToFacility = (mediaId: string, targetFacilityId: string) => {
    const media = mediaList.find((m) => m.id === mediaId);
    if (media) {
      const currentShared = media.sharedToFacilityIds || [];
      if (!currentShared.includes(targetFacilityId)) {
        setMediaList((prev) =>
          prev.map((m) =>
            m.id === mediaId
              ? { ...m, sharedToFacilityIds: [...currentShared, targetFacilityId] }
              : m
          )
        );
        addNotification({
          code: 'NTF-04',
          title: 'Chia sẻ nguồn tin',
          content: `Bạn có Media file [${media.title}] được chia sẻ từ cơ sở cấp trên.`,
          recipientRole: 'Approver',
        });
      }
    }
  };

  // Templates & Playlists
  const addTemplate = (tpl: Omit<TemplateItem, 'id' | 'isUsed' | 'createdAt'>) => {
    const newTpl: TemplateItem = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      isUsed: false,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [newTpl, ...prev]);
  };

  const deleteTemplate = (id: string): { success: boolean; message: string } => {
    const tpl = templates.find((t) => t.id === id);
    if (tpl?.isUsed) {
      return { success: false, message: 'Bản mẫu đã được sử dụng trong bản tin, không thể xóa.' };
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    return { success: true, message: 'Đã xóa bản mẫu thành công.' };
  };

  const addPlaylist = (pls: Omit<PlaylistItem, 'id' | 'isUsed' | 'createdAt'>) => {
    const newPls: PlaylistItem = {
      ...pls,
      id: `pls-${Date.now()}`,
      isUsed: false,
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => [newPls, ...prev]);
  };

  const deletePlaylist = (id: string): { success: boolean; message: string } => {
    const pls = playlists.find((p) => p.id === id);
    if (pls?.isUsed) {
      return { success: false, message: 'Danh sách phát đã được sử dụng trong bản tin, không thể xóa.' };
    }
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    return { success: true, message: 'Đã xóa danh sách phát thành công.' };
  };

  // Broadcasts Methods
  const addBroadcast = (broadcast: Omit<Broadcast, 'id' | 'createdAt'>) => {
    const newBrd: Broadcast = {
      ...broadcast,
      id: `brd-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBroadcasts((prev) => [newBrd, ...prev]);

    // Đánh dấu template hoặc playlist là đã sử dụng
    if (broadcast.contentType === 'template') {
      setTemplates((prev) =>
        prev.map((t) => (t.id === broadcast.contentId ? { ...t, isUsed: true } : t))
      );
    } else if (broadcast.contentType === 'playlist') {
      setPlaylists((prev) =>
        prev.map((p) => (p.id === broadcast.contentId ? { ...p, isUsed: true } : p))
      );
    }
  };

  const updateBroadcastStatus = (id: string, status: Broadcast['status']) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const approveBroadcast = (id: string, approverName: string) => {
    const brd = broadcasts.find((b) => b.id === id);
    if (brd) {
      setBroadcasts((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'scheduled' } : b))
      );
      addNotification({
        code: 'NTF-06',
        title: 'Bản tin được phê duyệt',
        content: `Bản tin [${brd.title}] đã được phê duyệt bởi ${approverName}.`,
        recipientRole: 'Creator',
      });
    }
  };

  const rejectBroadcast = (id: string, reason: string, approverName: string) => {
    const brd = broadcasts.find((b) => b.id === id);
    if (brd) {
      setBroadcasts((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: 'rejected', rejectionReason: reason.slice(0, 510) }
            : b
        )
      );
      addNotification({
        code: 'NTF-08',
        title: 'Từ chối duyệt bản tin',
        content: `Bản tin [${brd.title}] đã bị từ chối duyệt bởi ${approverName}. Lý do: ${reason}`,
        recipientRole: 'Creator',
      });
    }
  };

  const deleteBroadcast = (id: string): { success: boolean; message: string } => {
    const brd = broadcasts.find((b) => b.id === id);
    if (!brd) return { success: false, message: 'Không tìm thấy bản tin.' };
    // SRS USR-BRD-05: Chỉ xóa bản tin Chờ duyệt, Từ chối duyệt hoặc Đã hủy
    if (!['pending', 'rejected', 'cancelled'].includes(brd.status)) {
      return {
        success: false,
        message: 'Chỉ có thể xóa bản tin ở trạng thái: Chờ duyệt, Từ chối duyệt hoặc Đã hủy.',
      };
    }
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    return { success: true, message: 'Đã xóa bản tin thành công.' };
  };

  // Service & Upgrade Packages
  const addServicePackage = (pkg: Omit<ServicePackage, 'id'>) => {
    const newPkg: ServicePackage = { ...pkg, id: `pkg-${Date.now()}` };
    setPackages((prev) => [...prev, newPkg]);
  };

  const updateServicePackage = (id: string, data: Partial<ServicePackage>) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteServicePackage = (id: string): { success: boolean; message: string } => {
    const pkg = packages.find((p) => p.id === id);
    if (pkg?.status === 'active') {
      return { success: false, message: 'Gói cước đang kinh doanh không thể xóa. Vui lòng ngưng kinh doanh trước.' };
    }
    setPackages((prev) => prev.filter((p) => p.id !== id));
    return { success: true, message: 'Đã xóa gói cước.' };
  };

  const addUpgradePackage = (upg: Omit<UpgradePackage, 'id' | 'purchasedCount'>) => {
    const newUpg: UpgradePackage = {
      ...upg,
      id: `upg-${Date.now()}`,
      purchasedCount: 0,
    };
    setUpgradePackages((prev) => [...prev, newUpg]);
  };

  const buyUpgradePackage = (orgId: string, upgId: string) => {
    const upg = upgradePackages.find((u) => u.id === upgId);
    const org = organizations.find((o) => o.id === orgId);
    if (!upg || !org) return;

    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
              ...o,
              storageTotalMB: o.storageTotalMB + upg.extraStorageGB * 1024,
              maxDevices: o.maxDevices + upg.extraDevices,
            }
          : o
      )
    );

    setUpgradePackages((prev) =>
      prev.map((u) =>
        u.id === upgId ? { ...u, purchasedCount: u.purchasedCount + 1 } : u
      )
    );

    const newTxn: PackageTransaction = {
      id: `txn-${Date.now()}`,
      orgId: org.id,
      orgName: org.name,
      packageName: upg.name,
      amountVND: upg.priceVND,
      type: 'upgrade',
      status: 'success',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  return (
    <MtcDataContext.Provider
      value={{
        organizations,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        renewOrganizationPackage,
        cancelAutoRenew,
        switchOrganizationPackage,

        facilities,
        addFacility,
        updateFacility,
        deleteFacility,

        devices,
        addDevice,
        updateDevice,
        deleteDevice,
        setDevicesVolume,
        restartDevice,
        generateDeviceLoginCode,

        mediaList,
        addMedia,
        updateMedia,
        deleteMedia,
        approveMedia,
        rejectMedia,
        shareMediaToFacility,

        templates,
        addTemplate,
        deleteTemplate,
        playlists,
        addPlaylist,
        deletePlaylist,

        broadcasts,
        addBroadcast,
        updateBroadcastStatus,
        approveBroadcast,
        rejectBroadcast,
        deleteBroadcast,

        packages,
        upgradePackages,
        transactions,
        addServicePackage,
        updateServicePackage,
        deleteServicePackage,
        addUpgradePackage,
        buyUpgradePackage,

        notifications,
        markNotificationAsRead,
        addNotification,
        activityLogs,
        logAction,

        errorDefinitions: INITIAL_ERROR_DEFINITIONS,
      }}
    >
      {children}
    </MtcDataContext.Provider>
  );
};

export const useMtcData = () => {
  const context = useContext(MtcDataContext);
  if (!context) throw new Error('useMtcData must be used within MtcDataProvider');
  return context;
};
