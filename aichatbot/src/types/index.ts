export type TablePayload = {
  type: 'TABLE';
  columns: string[];
  rows: any[][];
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  payload?: any;
  sender?: 'Atlas' | 'User';
};

export type Profile = {
  email?: string;
  employee_id?: string;
  company_id?: string;
  employee_name?: string;
};

/** Session from login API – stored in AsyncStorage as 'session' */
export type AuthSession = {
  access_token: string;
  refresh_token: string;
  [key: string]: unknown;
};

export type TabKey = 'entryView' | 'history';

export type RootStackParamList = {
  Login:
    | {
        prefill?: {
          email?: string;
          employeeId?: string;
          companyName?: string;
          companyAddress?: string;
          password?: string;
        };
      }
    | undefined;
  SignUp: undefined;
  Main: {
    profile: Profile;
  };
};
