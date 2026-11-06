export interface CategoryUser {
  id: number;
  username: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  email: string;
  role: string;
  categoryId: number;
}

export type CategoryUserFormValues = Omit<CategoryUser, "id" | "categoryId">;
