import type { CategoryUser } from "../types/categoryUsers.types";

export const mockCategoryUsers: CategoryUser[] = Array.from(
  { length: 100 },
  (_, index) => {
    const categoryId = Math.floor(index / 10) + 1;
    const userNumber = (index % 10) + 1;

    return {
      id: index + 1,
      username: `User ${userNumber}`,
      fullName: `Người dùng ${userNumber}`,
      identityNumber: "837748737",
      phone: "0390384838",
      email: `admin${index + 1}@dumain.com`,
      role: "Admin",
      categoryId,
    };
  },
);
