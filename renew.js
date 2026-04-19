const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
  });

  // Inyectar las cookies de sesión
  await context.addCookies([
    {
      name: 'pterodactyl_session',
      value: process.env.COOKIE,
      domain: 'panel.freegamehost.xyz',
      path: '/'
    },
    {
      name: 'XSRF-TOKEN',
      value: process.env.XSRF_TOKEN,
      domain: 'panel.freegamehost.xyz',
      path: '/'
    }
  ]);

  const page = await context.newPage();

  console.log('Navegando a la página...');
  await page.goto('https://panel.freegamehost.xyz/server/02c0a1d9', {
    waitUntil: 'networkidle'
  });

  // Esperar a que el botón Renew esté disponible (no en cooldown)
  console.log('Esperando el botón Renew...');
  try {
    await page.waitForSelector('button:has-text("Renew")', { timeout: 15000 });
    
    // Esperar el Turnstile
    await page.waitForTimeout(3000);
    
    await page.click('button:has-text("Renew")');
    console.log('✅ Clic en Renew ejecutado');
    
    await page.waitForTimeout(3000);
    console.log('✅ Renew completado');
  } catch (e) {
    console.log('⚠️ Botón no disponible (cooldown activo o error):', e.message);
  }

  await browser.close();
})();
