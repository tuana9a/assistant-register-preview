"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
async function main() {
    const app = new app_1.App();
    await app.init();
    app.run();
}
main();
//# sourceMappingURL=main.js.map