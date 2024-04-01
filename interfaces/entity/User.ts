export interface User {
  id: number;
  name: string;
  account: string;
  email: string;
  password: string;
  status: "正常" | "已禁封";
}
