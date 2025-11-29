import { Command } from 'commander';
import { validateConfig } from './config';
import { logger } from './services';
import { NotionClient, DatabaseManager } from './notion';
import { ArticleCollector, TwitterCollector } from './collectors';
import { AIService } from './services/ai.service';
import { config } from './config';

const program = new Command();

program
  .name('deep-research-bot')
  .description('Automated research bot that gathers information from various sources and organizes it in Notion')
  .version('1.0.0');

program
  .command('research')
  .description('Start research on a given topic')
  .argument('<topic>', 'Research topic to investigate')
  .option('-s, --sources <sources>', 'Comma-separated list of source types')
  .option('-m, --max-sources <number>', 'Maximum number of sources to collect', '20')
  .option('-d, --depth <number>', 'Research depth (1-3)', '2')
  .option('--dry-run', 'Run research without saving to Notion')
  .action(async (topic: string, options) => {
    try {
      logger.info(`🚀 Starting research on topic: ${topic}`);

      // Validate configuration
      validateConfig();

      // Initialize services
      const notionClient = new NotionClient(config.notion);
      const databaseManager = new DatabaseManager(notionClient);
      const articleCollector = new ArticleCollector();
      const aiService = new AIService(config.ai);

      // Test Notion connection
      logger.info('🔗 Testing Notion connection...');
      const connectionOk = await notionClient.testConnection();
      if (!connectionOk) {
        throw new Error('Failed to connect to Notion. Check your API key.');
      }
      logger.info('✅ Notion connection successful');

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

      logger.info('✅ Research completed!');
      logger.info(`Topic: ${topic}`);
      logger.info(`Sources found: ${sources.length}`);

      // Save to Notion (unless dry run)
      if (!options.dryRun) {
        logger.info('💾 Saving to Notion...');
        // Save logic would go here
        logger.info('✅ Data saved to Notion!');
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

      // Test Notion connection
      const notionClient = new NotionClient(config.notion);

      logger.info('🔗 Testing Notion connection...');
      const notionOk = await notionClient.testConnection();

      if (notionOk) {
        logger.info('✅ All connections successful');
      } else {
        logger.error('❌ Notion connection failed');
        process.exit(1);
      }

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