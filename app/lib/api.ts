import { Platform } from 'react-native';

// Where the GradeVault backend lives. `localhost` works for web and for iOS
// simulators; a physical phone on Expo Go needs your computer's LAN IP
// instead (e.g. "http://192.168.1.23:4000") since "localhost" on the phone
// means the phone itself. See the README for how to set this.
const DEV_HOST = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');

export const API_URL = DEV_HOST;

export type Role = 'parent' | 'kid';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatar: string;
  familyId: string;
}

export interface KidSummary {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

export interface FamilyMe {
  family: { id: string; name: string; inviteCode?: string };
  settings: { threshold: number; pointValueCents: number; currency: string };
  gifts: { id: string; name: string; emoji: string; costPoints: number }[];
  kids: KidSummary[];
}

export interface Assignment {
  id: string;
  kidId: string;
  subject: string;
  title: string;
  mark: number;
  status: 'pending' | 'approved' | 'rejected';
  pointsAwarded: number | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface Redemption {
  id: string;
  kidId: string;
  type: 'cash' | 'gift';
  pointsSpent: number;
  label: string;
  status: 'requested' | 'fulfilled' | 'declined';
  createdAt: string;
  decidedAt: string | null;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

export const api = {
  signupParent: (data: { familyName: string; name: string; username: string; password: string }) =>
    request<{ token: string; user: AuthUser; inviteCode: string }>('/auth/signup-parent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  signupKid: (data: { inviteCode: string; name: string; username: string; password: string; avatar?: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/signup-kid', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { username: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: () => request<FamilyMe>('/family/me'),
  updateSettings: (data: { threshold?: number; pointValueCents?: number; currency?: string }) =>
    request<{ threshold: number; pointValueCents: number; currency: string }>('/family/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  addGift: (data: { name: string; emoji?: string; costPoints: number }) =>
    request<{ id: string; name: string; emoji: string; costPoints: number }>('/family/gifts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeGift: (id: string) => request<void>(`/family/gifts/${id}`, { method: 'DELETE' }),

  createAssignment: (data: { subject: string; title: string; mark: number }) =>
    request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  listAssignments: (kidId?: string) =>
    request<Assignment[]>(`/assignments${kidId ? `?kidId=${kidId}` : ''}`),
  pendingAssignments: () => request<Assignment[]>('/assignments/pending'),
  decideAssignment: (id: string, decision: 'approve' | 'reject') =>
    request<{ assignment: Assignment; kidBalance: number }>(`/assignments/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),

  listRedemptions: () => request<Redemption[]>('/redemptions'),
  requestRedemption: (data: { type: 'cash' | 'gift'; giftId?: string; points?: number }) =>
    request<Redemption>('/redemptions', { method: 'POST', body: JSON.stringify(data) }),
  decideRedemption: (id: string, decision: 'fulfill' | 'decline') =>
    request<{ redemption: Redemption; kidBalance: number }>(`/redemptions/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),
};

export { ApiError };
