import { chromium } from 'playwright';

function pause(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

(async () => {
    try {
        const browser = await chromium.launch({
            args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'], //https://github.com/microsoft/playwright/issues/2525
            //firefoxUserPrefs: { "media.navigator.streams.fake": true, "media.navigator.permission.disabled": true }, // for firefox
            headless: false,
            slowMo: 50
        });
        const ctx = await browser.newContext();
        ctx.grantPermissions(['camera', 'microphone']);
        const page = await ctx.newPage();

        //await page.goto(`file:///${process.cwd()}/prebuilt_demo_prejoin.html`);
        await page.goto(`http://localhost:8000/prebuilt_demo_prejoin.html`);

        await page.pause();
        await page.waitForSelector('#ready-room-root');
        // await page.waitForLoadState()
        if (await page.$('#ready-room-root > div > sw-prejoin > div > div > div.text-center > h1')) { // Show Prejoin H1
            // Camera
            await page.locator('text=SquareCheckboxAllow camera access').click();
            await pause(500);

            await page.locator('text=Allow camera access').click();
            await pause(500);

            // Microphone
            await pause(500);
            await page.locator('button:has-text("Continue")').click();
            await pause(1000);

            // Camera Selection
            if (await page.$('text=Select your camera')) {
                // video = true;
                await page.locator('button:has-text("Continue")').click();
                await pause(1000);
            }

            // Audio Selection
            if (await page.$('text=Select your microphone and speakers')) {
                // audio = true;
                await page.locator('text=Test Audio').click();
                await pause(3000);

                // await page.locator('text=StopStop Audio Test').click();
                // await pause(500);
            }

            await page.locator('button:has-text("Join")').click();
        }

        await page.waitForSelector('#ready-room-video-root');

        if (await page.$('video')) {
            await page.locator('#ready-room-video-root').hover();
            await pause(500);
            await page.waitForSelector('top-bar button:has-text("People")');
            await page.locator('top-bar button:has-text("People")').click();
            await pause(500);
            await page.locator('button:has-text("Close")').click();

            const audioExist = page.$$('bottom-bar button:has-text("Mic")');
            if (audioExist) {
                await page.locator('bottom-bar button:has-text("Mic")').click();
            } 

            const videoExist = await page.$$('bottom-bar button:has-text("Videocam")');
            if (videoExist) {
                await page.locator('bottom-bar button:has-text("Videocam")').click();
                await pause(500);
                await page.locator('bottom-bar button:has-text("Videocam")').click();
            } 

            await pause(5000);
            await page.locator('button:has-text("Leave")').click();
        }

        await browser.close();
    } catch (e) {
        console.error('[CATCH ERROR] ', e);
        // await browser.close();
    }

})();