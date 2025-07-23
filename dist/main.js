"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express = require("express");
let cachedApp;
async function bootstrap() {
    if (!cachedApp) {
        const expressApp = express();
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        app.enableCors();
        await app.init();
        cachedApp = expressApp;
    }
    return cachedApp;
}
if (process.env.NODE_ENV !== 'production') {
    bootstrap().then(app => {
        const port = process.env.PORT || 3001;
        app.listen(port, () => {
            console.log(`Application is running on port ${port}`);
        });
    });
}
exports.default = async (req, res) => {
    const app = await bootstrap();
    return app(req, res);
};
//# sourceMappingURL=main.js.map