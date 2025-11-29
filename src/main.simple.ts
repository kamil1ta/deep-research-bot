import { Command } from 'commander';
import { validateConfig } from './config';
import { logger } from './services';
import { ArticleCollector } from './collectors/article.collector';

const program = new Command();

program
  .name('deep-research-bot')
  .description('Automated research bot that gathers information from various sources and organizes it in Notion')
  .version('1.0.0');

program
  .command('research')
  .description('Start research on a given topic')
  .argument('<topic>', 'Research topic to investigate')
  .option('-m, --max-sources <number>', 'Maximum number of sources to collect', '10')
  .option('--dry-run', 'Run research without saving to Notion')
  .action(async (topic: string, options) => {
    try {
      logger.info(`🚀 Starting research on topic: ${topic}`);

      // Validate configuration
      validateConfig();

      // Initialize collector
      const articleCollector = new ArticleCollector();

      // Collect sources
      logger.info('📚 Collecting research sources...');
      const maxSources = parseInt(options.maxSources);
      const sources = await articleCollector.collect(topic, {
        maxResults: maxSources,
      });

      logger.info(`📊 Found ${sources.length} sources`);

      if (sources.length === 0) {
        logger.warn('⚠️  No sources found for given topic');
        return;
      }

      // Display results
      logger.info('✅ Research completed!');
      logger.info(`Topic: ${topic}`);
      logger.info(`Sources found: ${sources.length}`);

      sources.forEach((source, index) => {
        console.log(`\n${index + 1}. ${source.title}`);
        console.log(`   Type: ${source.type}`);
        console.log(`   URL: ${source.url}`);
        console.log(`   Author: ${source.author || 'Unknown'}`);
        console.log(`   Content preview: ${source.content.substring(0, 200)}...`);
      });

      if (!options.dryRun) {
        logger.info('💾 Notion integration would save these sources to Notion');
      } else {
        logger.info('🔍 Dry run completed - no data was saved to Notion');
      }

    } catch (error) {
      logger.error('Research failed:', error);
      process.exit(1);
    }
  });

program
  .command('config-test')
  .description('Test configuration and connections')
  .action(async () => {
    try {
      logger.info('🔧 Testing configuration...');
      validateConfig();
      logger.info('✅ Configuration is valid');
      logger.info('✅ Basic configuration test successful');
    } catch (error) {
      logger.error('Configuration test failed:', error);
      process.exit(1);
    }
  });

program
  .command('init-config')
  .description('Initialize configuration file')
  .action(async () => {
    const fs = await import('fs');
    const path = await import('path');

    const configDir = path.join(process.cwd(), 'config');
    const envPath = path.join(configDir, '.env');

    if (fs.existsSync(envPath)) {
      logger.warn('⚠️  .env file already exists');
      return;
    }

    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Copy template to .env
    const templatePath = path.join(configDir, '.env.template');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(envPath, templateContent);

    logger.info('✅ Configuration file created at config/.env');
    logger.info('📝 Please edit config/.env with your API keys and configuration');
  });

if (process.argv.length === 2) {
  program.help();
}

program.parse();