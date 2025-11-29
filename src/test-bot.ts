import { config, validateConfig } from './config';
import { logger } from './services';

async function testBasicFunctionality() {
  try {
    console.log('🤖 Deep Research Bot - Basic Test');
    console.log('=================================');

    // Test configuration
    console.log('🔧 Testing configuration...');
    validateConfig();
    console.log('✅ Configuration is valid');

    // Test imports
    console.log('📦 Testing imports...');
    const axios = await import('axios');
    console.log('✅ Axios imported successfully');

    // Test basic network request
    console.log('🌐 Testing network connectivity...');
    const response = await axios.get('https://httpbin.org/get');
    console.log('✅ Network connectivity successful');

    // Test file system
    console.log('📁 Testing file system...');
    const fs = await import('fs');
    const path = await import('path');

    const testData = { test: 'Hello from Deep Research Bot!' };
    const testFile = path.join(process.cwd(), 'test-output.json');

    fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));
    console.log('✅ File system operations successful');

    console.log('\n🎉 All basic tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up your API keys in config/.env');
    console.log('2. Run: npm run init-config');
    console.log('3. Edit config/.env with your API keys');
    console.log('4. Run: npm run start -- research "your topic"');

    // Clean up test file
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBasicFunctionality();