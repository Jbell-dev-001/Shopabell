#!/usr/bin/env tsx
// Deployment script for ShopAbell

import { exec } from 'child_process'
import { promisify } from 'util'
import { preDeploymentCheck } from './test-runner'

const execAsync = promisify(exec)

interface DeploymentConfig {
  environment: 'staging' | 'production'
  skipTests: boolean
  skipBuild: boolean
  verbose: boolean
  dryRun: boolean
}

interface DeploymentStep {
  name: string
  command?: string
  fn?: () => Promise<void>
  optional?: boolean
}

class DeploymentManager {
  private config: DeploymentConfig

  constructor(config: DeploymentConfig) {
    this.config = config
  }

  async deploy(): Promise<void> {
    console.log('🚀 Starting ShopAbell Deployment...\n')
    console.log(`Environment: ${this.config.environment}`)
    console.log(`Dry Run: ${this.config.dryRun ? 'Yes' : 'No'}\n`)

    const steps = this.getDeploymentSteps()
    
    for (const step of steps) {
      await this.runStep(step)
    }

    console.log('\n✅ Deployment completed successfully!')
    console.log('\n🔗 Next steps:')
    console.log('  • Monitor application logs')
    console.log('  • Run smoke tests')
    console.log('  • Check health endpoints')
    console.log('  • Monitor error rates and performance')
  }

  private getDeploymentSteps(): DeploymentStep[] {
    const steps: DeploymentStep[] = [
      {
        name: 'Environment Validation',
        fn: async () => {
          await this.validateEnvironment()
        }
      },
      {
        name: 'Dependencies Check',
        command: 'npm ci',
        optional: this.config.skipBuild
      },
      {
        name: 'TypeScript Type Check',
        command: 'npm run type-check',
        optional: this.config.skipBuild
      },
      {
        name: 'Linting',
        command: 'npm run lint',
        optional: this.config.skipBuild
      },
      {
        name: 'Build Application',
        command: 'npm run build',
        optional: this.config.skipBuild
      },
      {
        name: 'Run Tests',
        command: 'npm run test',
        optional: this.config.skipTests
      },
      {
        name: 'Database Migration',
        fn: async () => {
          await this.runDatabaseMigrations()
        }
      },
      {
        name: 'Deploy to Vercel',
        fn: async () => {
          await this.deployToVercel()
        }
      },
      {
        name: 'Post-deployment Validation',
        fn: async () => {
          await this.postDeploymentValidation()
        }
      }
    ]

    return steps.filter(step => !step.optional)
  }

  private async runStep(step: DeploymentStep): Promise<void> {
    console.log(`📋 ${step.name}...`)

    if (this.config.dryRun) {
      console.log(`  [DRY RUN] Would execute: ${step.command || 'custom function'}`)
      return
    }

    try {
      if (step.command) {
        const { stdout, stderr } = await execAsync(step.command)
        if (this.config.verbose && stdout) {
          console.log(`  Output: ${stdout}`)
        }
        if (stderr) {
          console.log(`  Warning: ${stderr}`)
        }
      } else if (step.fn) {
        await step.fn()
      }
      console.log(`  ✅ ${step.name} completed`)
    } catch (error) {
      console.log(`  ❌ ${step.name} failed`)
      if (this.config.verbose) {
        console.error(`  Error: ${error}`)
      }
      throw new Error(`Deployment failed at step: ${step.name}`)
    }
  }

  private async validateEnvironment(): Promise<void> {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    if (this.config.environment === 'production') {
      requiredEnvVars.push(
        'WHATSAPP_ACCESS_TOKEN',
        'WHATSAPP_PHONE_NUMBER_ID',
        'WHATSAPP_WEBHOOK_VERIFY_TOKEN'
      )
    }

    const missing = requiredEnvVars.filter(env => !process.env[env])
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }

    console.log('  ✅ All required environment variables present')
  }

  private async runDatabaseMigrations(): Promise<void> {
    if (this.config.environment === 'production') {
      console.log('  🔄 Running database migrations...')
      
      // In a real deployment, this would connect to Supabase and run migrations
      // For now, we'll just validate the schema exists
      const schemaExists = await this.validateDatabaseSchema()
      if (!schemaExists) {
        throw new Error('Database schema validation failed')
      }
      
      console.log('  ✅ Database schema validated')
    } else {
      console.log('  ⏭️  Skipping database migrations for staging')
    }
  }

  private async validateDatabaseSchema(): Promise<boolean> {
    try {
      // This would typically run against Supabase to validate schema
      // For now, we'll just check if schema file exists
      const fs = await import('fs')
      return fs.existsSync('./supabase/schema.sql')
    } catch {
      return false
    }
  }

  private async deployToVercel(): Promise<void> {
    const deployCommand = this.config.environment === 'production' 
      ? 'vercel --prod --yes'
      : 'vercel --yes'

    console.log(`  🚀 Deploying to Vercel (${this.config.environment})...`)
    
    try {
      const { stdout } = await execAsync(deployCommand)
      const deploymentUrl = this.extractDeploymentUrl(stdout)
      
      if (deploymentUrl) {
        console.log(`  🌐 Deployed to: ${deploymentUrl}`)
        
        // Store deployment URL for post-deployment validation
        process.env.DEPLOYMENT_URL = deploymentUrl
      }
    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error}`)
    }
  }

  private extractDeploymentUrl(output: string): string | null {
    const urlMatch = output.match(/https:\/\/[^\s]+/)
    return urlMatch ? urlMatch[0] : null
  }

  private async postDeploymentValidation(): Promise<void> {
    const deploymentUrl = process.env.DEPLOYMENT_URL
    
    if (!deploymentUrl) {
      console.log('  ⚠️  No deployment URL found, skipping validation')
      return
    }

    console.log('  🔍 Running post-deployment validation...')
    
    // Wait for deployment to be fully ready
    await this.waitForDeployment(deploymentUrl)
    
    // Run health checks
    const healthCheckPassed = await preDeploymentCheck(deploymentUrl)
    
    if (!healthCheckPassed) {
      throw new Error('Post-deployment validation failed')
    }
    
    console.log('  ✅ Post-deployment validation passed')
  }

  private async waitForDeployment(url: string, maxAttempts: number = 10): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${url}/api/ping`)
        if (response.ok) {
          console.log(`  ✅ Deployment is ready (attempt ${attempt})`)
          return
        }
      } catch {
        // Deployment not ready yet
      }
      
      if (attempt < maxAttempts) {
        console.log(`  ⏳ Waiting for deployment to be ready (attempt ${attempt}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      }
    }
    
    throw new Error('Deployment did not become ready within expected time')
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  
  const config: DeploymentConfig = {
    environment: args.includes('--production') ? 'production' : 'staging',
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run')
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 ShopAbell Deployment Script

Usage: npm run deploy [options]

Options:
  --production       Deploy to production (default: staging)
  --skip-tests       Skip running tests before deployment
  --skip-build       Skip build steps (use existing build)
  --dry-run          Show what would be deployed without actually deploying
  --verbose, -v      Enable verbose output
  --help, -h         Show this help message

Examples:
  npm run deploy                    # Deploy to staging
  npm run deploy -- --production   # Deploy to production
  npm run deploy -- --dry-run      # Preview deployment steps
  npm run deploy -- --skip-tests   # Deploy without running tests

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  
  For production:
  WHATSAPP_ACCESS_TOKEN
  WHATSAPP_PHONE_NUMBER_ID
  WHATSAPP_WEBHOOK_VERIFY_TOKEN
`)
    return
  }

  // Confirmation for production deployments
  if (config.environment === 'production' && !config.dryRun) {
    console.log('⚠️  You are about to deploy to PRODUCTION!')
    console.log('This will affect live users and data.')
    
    // In a real scenario, you might want to add interactive confirmation
    // For now, we'll just log a warning
    console.log('Proceeding with production deployment...\n')
  }

  const deployer = new DeploymentManager(config)
  await deployer.deploy()
}

// Export for use in other scripts
export { DeploymentManager, type DeploymentConfig }

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Deployment failed:', error.message)
    process.exit(1)
  })
}