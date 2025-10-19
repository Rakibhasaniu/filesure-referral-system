export type TRegisterUser = {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
};

export type TLoginUser = {
  id: string;
  password: string;
};
