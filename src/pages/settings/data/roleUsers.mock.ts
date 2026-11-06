import type { RoleUser } from "../types/roleUsers.types";

const updateTimes = [
  "19:00:00",
  "19:00:01",
  "19:01:00",
  "19:50:00",
  "19:05:00",
  "19:24:00",
  "19:15:00",
  "19:23:00",
  "19:36:00",
  "19:32:00",
];

export const mockRoleUsers: RoleUser[] = Array.from(
  { length: 100 },
  (_, index) => {
    const number = index + 1;

    return {
      id: number,
      username: `User ${number}`,
      fullName: "Nguyễn Văn A",
      identityNumber: "241876543",
      phone: "0821860001",
      email: number === 1 ? "admin1@domain.com" : "nv1@domain.com",
      role: number === 1 ? "Admin" : `Role ${((number - 2) % 9) + 1}`,
      status: index % 10 < 5 ? "active" : "inactive",
      timezone: "Asia/Ho_Chi_Minh",
      updatedAt: `25/07/2021 ${updateTimes[index % 10]}`,
    };
  },
);
