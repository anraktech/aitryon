#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  
  const prisma = new PrismaClient()
  
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📊 Tables found:', tables)
    
    // Test specific table queries
    try {
      const sessionCount = await prisma.session.count()
      console.log('✅ Session table accessible, count:', sessionCount)
    } catch (err) {
      console.log('❌ Session table error:', err.message)
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
  
  return true
}

// Run test
testDatabase()
  .then(() => {
    console.log('✅ Database test completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('💥 Database test failed:', err)
    process.exit(1)
  })