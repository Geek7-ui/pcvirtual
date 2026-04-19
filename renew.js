const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
  });

  await context.addCookies([
    {
      name: 'pterodactyl_session',
      value: process.env.COOKIE,
      domain: 'panel.freegamehost.xyz',
      path: '/',
      secure: true
    },
    {
      name: 'XSRF-TOKEN',
      value: process.env.XSRF_TOKEN,
      domain: 'panel.freegamehost.xyz',
      path: '/',
      secure: true
    }
  ]);

  const page = await context.newPage();

  console.log('Navegando a la página...');
  await page.goto('https://panel.freegamehost.xyz/server/02c0a1d9', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Esperando el botón +8 Hours...');
  try {
    // Selector preciso con el texto exacto del botón
    await page.waitForSelector('button:has-text("+8 Hours")', { timeout: 15000 });
    
    // Esperar que el Turnstile se resuelva
    await page.waitForTimeout(4000);
    
    await page.click('button:has-text("+8 Hours")');
    console.log('✅ Clic en +8 Hours ejecutado');
    
    await page.waitForTimeout(3000);
    console.log('✅ Renew completado');
  } catch (e) {
    console.log('⚠️ Botón no disponible (cooldown activo o sesión expirada):', e.message);
  }

  await browser.close();
})();
