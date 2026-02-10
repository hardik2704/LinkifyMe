export interface CheckoutFormData {
  linkedinUrl: string;
  email: string;
  phone: string;
  targetRole: string;
}

export enum CheckoutStep {
  DETAILS = 1,
  PAYMENT = 2,
  REVIEW = 3
}