export interface UserSession {
  username: string;
  name: string;
  loginTime: number;
}

const AUTH_STORAGE_KEY = 'tracku_auth_session_v1';

export const DEFAULT_USER = {
  username: 'Abir',
  password: '095161251',
  name: 'Abir'
};

export const getCurrentUser = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse user session:', err);
    return null;
  }
};

export const loginUser = (usernameInput: string, passwordInput: string): { success: boolean; message?: string; session?: UserSession } => {
  const cleanUsername = usernameInput.trim();
  const cleanPassword = passwordInput.trim();

  // Validate credentials against default account or case-insensitive username
  if (
    (cleanUsername.toLowerCase() === DEFAULT_USER.username.toLowerCase() || cleanUsername === 'abir') &&
    cleanPassword === DEFAULT_USER.password
  ) {
    const session: UserSession = {
      username: DEFAULT_USER.username,
      name: DEFAULT_USER.name,
      loginTime: Date.now()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  }

  return { success: false, message: 'Invalid username or password. (Default: Abir / 095161251)' };
};

export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
