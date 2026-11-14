import { authApi } from "../api/authApi";
import { rolesApi } from "../api/rolesApi";

export async function getCurrentUserPermissions(): Promise<string[]> {
  // Lấy thông tin người dùng hiện tại
  const user = await authApi.getMe();

  // Lấy danh sách vai trò theo tổ chức
  const roles = await rolesApi.getRoles(user.organizationId);

  // Tìm vai trò khớp với tài khoản
  const role = roles.find((item) => item.roleCode === user.role);

  if (!role) {
    throw new Error("Không tìm thấy vai trò của tài khoản.");
  }

  // Lấy quyền được gán cho vai trò
  const roleDetail = await rolesApi.getRoleById(role.id);

  return roleDetail.permissions
    .filter((permission) => permission.isAssigned)
    .map((permission) => permission.permissionCode);
}
