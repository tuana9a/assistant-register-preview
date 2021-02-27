import { App } from './app';

async function main() {
    const app = new App();
    await app.setup();
    app.run();
}

main();
