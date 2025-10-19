import { z } from 'zod';

const makePurchaseValidationSchema = z.object({
  body: z.object({
    productName: z
      .string()
      .optional()
      .default('Digital Template'),
    amount: z
      .number()
      .positive('Amount must be positive')
      .optional()
      .default(10),
  }),
});

export const PurchaseValidation = {
  makePurchaseValidationSchema,
};
