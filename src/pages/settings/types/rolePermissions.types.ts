export interface RolePermission {
  id: string;
  name: string;
}

export interface RolePermissionGroup {
  id: string;
  name: string;
  permissions: RolePermission[];
}

export interface RolePermissionSelection {
  roleId: number;
  permissionIds: string[];
}
