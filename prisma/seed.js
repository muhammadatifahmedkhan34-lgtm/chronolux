const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main(){
  const email = 'admin@chronolux.test'
  const existing = await prisma.user.findUnique({ where: { email } })
  if(existing){
    console.log('Admin already exists')
  } else {
    const passwordHash = await bcrypt.hash('AdminPass123!', 10)
    const user = await prisma.user.create({ data: { email, passwordHash, name: 'Admin', role: 'ADMIN', isVerified: true } })
    console.log('Created admin:', user.email)
  }

  // seed brands
  const brands = [
    'Rolex', 'Omega', 'Patek Philippe', 'Seiko', 'Casio', 'Tag Heuer', 'Tissot', 'Audemars Piguet'
  ]
  for (const name of brands){
    await prisma.brand.upsert({ where: { name }, update: {}, create: { name, slug: name.toLowerCase().replace(/\s+/g, '-') } })
  }

  // seed categories
  const categories = [
    'Luxury Watches', 'Sports Watches', 'Dress Watches', 'Vintage Watches', 'Automatic Watches', 'Quartz Watches', 'Chronograph Watches'
  ]
  for (const name of categories){
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } })
  }
}

main()
  .catch(e=>{ console.error(e); process.exit(1) })
  .finally(()=>prisma.$disconnect())
