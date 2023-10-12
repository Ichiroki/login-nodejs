import { PrismaClient, Prisma } from "@prisma/client"
import { z } from 'zod'

export const UserValidate = z.object({
   name: z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
   email: z.string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string 😖"
   }).email({message: "Email must be a valid email 😁"}),
   password: z.string().max(100).min(8, 'Password minimal have 8 characters 😁'),
})

//   id                String             @id @unique
//   email             String             @unique
//   name              String
//   password          String
//   UserProductsTable UserProductsTable?