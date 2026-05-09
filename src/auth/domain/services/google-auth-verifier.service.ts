export type GoogleIdentity = {
  email: string;
  emailVerified: boolean;
  subject: string;
};

export interface GoogleAuthVerifier {
  verifyWeb(idToken: string): Promise<GoogleIdentity>;
  verifyMobile(idToken: string): Promise<GoogleIdentity>;
}
