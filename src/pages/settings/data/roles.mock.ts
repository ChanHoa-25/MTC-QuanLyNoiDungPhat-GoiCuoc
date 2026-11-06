import type { Role } from "../types/roles.types";

export const mockRoles: Role[] = [
  {
    id: 1,
    name: "Group Admin",
    code: "Admin",
    description: "Vai trò 1",
    updatedAt: "25/07/2021 19:00:00",
  },
  ...Array.from({ length: 9 }, (_, index) => {
    const number = index + 1;

    return {
      id: number + 1,
      name: `Role ${number}`,
      code: `Role ${number}`,
      description: "Vai trò 1",
      updatedAt: `25/07/2021 19:${String(index).padStart(2, "0")}:00`,
    };
  }),
];
