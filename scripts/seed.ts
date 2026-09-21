import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Mandatory hidden test account
  const hash = await bcrypt.hash('Bm#3Zya2lg', 12)
  await prisma.user.upsert({
    where: { email: 'abacus-27f4137e@example.com' },
    update: { passwordHash: hash },
    create: {
      email: 'abacus-27f4137e@example.com',
      name: 'Admin',
      passwordHash: hash,
      role: 'admin',
    },
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
