import { sequelize } from '../config/database'
import { User } from '../models/User'
import { WorkZone } from '../models/WorkZone'

async function seed() {
  try {
    console.log('🌱 Starting database seed...')

    // Sync database
    await sequelize.sync({ force: false })
    console.log('✅ Database synced')

    // Create default admin user if not exists
    const adminExists = await User.findOne({ where: { email: 'admin@hexa-me.com' } })
    if (!adminExists) {
      await User.create({
        email: 'admin@hexa-me.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        employeeId: 'ADMIN001',
        department: 'Administration',
        jobTitle: 'System Administrator',
        isActive: true,
        biometricEnrolled: false,
      })
      console.log('✅ Default admin user created')
      console.log('   Email: admin@hexa-me.com')
      console.log('   Password: admin123')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    // Create sample work zone if none exist
    const zoneCount = await WorkZone.count()
    if (zoneCount === 0) {
      await WorkZone.create({
        name: 'Main Office',
        description: 'Primary office location',
        zoneType: 'circle',
        centerLat: 40.7128,
        centerLng: -74.0060,
        radius: 100,
        isRestricted: false,
        bufferDistance: 50,
        isActive: true,
      })
      console.log('✅ Sample work zone created')
    }

    // Create sample employee
    const employeeExists = await User.findOne({ where: { email: 'employee@hexa-me.com' } })
    if (!employeeExists) {
      await User.create({
        email: 'employee@hexa-me.com',
        password: 'employee123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'IT',
        jobTitle: 'Software Developer',
        isActive: true,
        biometricEnrolled: false,
      })
      console.log('✅ Sample employee created')
      console.log('   Email: employee@hexa-me.com')
      console.log('   Password: employee123')
    }

    console.log('🎉 Database seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()


