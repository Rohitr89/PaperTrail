export interface User {
  id: string;
  username: string;
  role: string;
}

export interface Document {
  id: string;
  owner: User;
  originalFileName: string;
  storageAlias: string;
  fileSize: number;
  createdAt: string;
}

export interface DocumentShare {
  document: Document;
  sharedWithUser: User;
  permissionLevel: 'VIEW' | 'EDIT' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}
