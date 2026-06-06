const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main(){
  const email = 'admin@chronolux.test'
  const existing = await prisma.user.findUnique({ where: { email } })
  if(existing){
    console.log('Admin already exists')
    return
  }
  const passwordHash = await bcrypt.hash('AdminPass123!', 10)
  const user = await prisma.user.create({ data: { email, passwordHash, name: 'Admin', role: 'ADMIN', isVerified: true } })
  console.log('Created admin:', user.email)
}

main()
  .catch(e=>{ console.error(e); process.exit(1) })
  .finally(()=>prisma.$disconnect())
