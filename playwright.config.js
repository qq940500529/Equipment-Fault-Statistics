import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* 并行运行测试 */
  fullyParallel: false,
  
  /* 失败时不重试 */
  retries: 0,
  
  /* 使用所有可用的CPU核心 */
  workers: 1,
  
  /* 测试超时时间 */
  timeout: 60 * 1000,
  
  /* 测试报告 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  /* 共享设置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:8000',
    
    /* 截图设置 */
    screenshot: 'only-on-failure',
    
    /* 视频设置 */
    video: 'retain-on-failure',
    
    /* 追踪设置 */
    trace: 'on-first-retry',
  },

  /* 配置项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 运行测试前启动本地服务器 */
  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 10 * 1000,
  },
});
