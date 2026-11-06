export interface Category {
  id: number;
  code: string;
  name: string;
}

export type CategoryFormValues = Omit<Category, "id">;
