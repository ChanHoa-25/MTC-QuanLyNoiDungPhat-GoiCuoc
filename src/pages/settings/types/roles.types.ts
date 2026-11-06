export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  updatedAt: string;
}

export type RoleFormValues = Pick<Role, "name" | "code" | "description">;
