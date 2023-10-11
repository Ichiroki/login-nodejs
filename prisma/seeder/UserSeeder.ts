import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function run() {
   const salt = await bcrypt.genSalt()
   const hashed = await bcrypt.hash('password', salt)

   await prisma.users.createMany({
      data: [
         {
            id: 'f778afe5-61d6-45c2-b021-f209fd216f00',
            name: 'Ichiroki',
            email: 'ichiroki@gmail.com',
            password: hashed
         },
         {
            id: '7eb478b4-6d41-4ca8-b35d-9bb0c4f8cb22',
            name: 'Mirai',
            email: 'mirai@gmail.com',
            password: hashed
         },
      ],
   })
}

run().catch((error) => console.log(error)).finally(async () => await prisma.$disconnect())