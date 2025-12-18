export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  errorMessage?: string;
  username: string;
  registeredEmail: string;
  loading: boolean;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface Auth {
  token: string;
  username: string;
}

export interface ResetPassword {
  email: string;
  newPassword: string;
  newPasswordToken?: string;
  currentPassword?: string;
}
