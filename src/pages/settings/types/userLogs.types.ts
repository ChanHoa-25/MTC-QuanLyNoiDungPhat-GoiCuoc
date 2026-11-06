export interface UserLog {
  id: number;
  actor: string;
  actionTime: string;
  functionName: string;
  oldContent: string;
  newContent: string;
}
