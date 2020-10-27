import {Configuration, Inject, PlatformApplication} from "@tsed/common";
import * as bodyParser from "body-parser";
import * as compress from "compression";
import * as methodOverride from "method-override";
import {NotFoundMiddleware} from "./server/middlewares/notFoundMiddleWare";

const rootDir = `${__dirname}/server`;

@Configuration({
    rootDir,
    acceptMimes: ["application/json"],
    mount: {
        "/rest": [
            `${rootDir}/controllers/**/*.ts` // Automatic Import, /!\ doesn't works with webpack/jest, use  require.context() or manual import instead
        ]
    },
    httpsPort: false, // CHANGE
    logger: {
        debug: true,
        logRequest: true,
        requestFields: ["reqId", "method", "url", "headers", "query", "params", "duration"]
    },
})
export class Server {
    @Inject()
    app: PlatformApplication;

    @Configuration()
    settings: Configuration;

    /**
     * This method let you configure the express middleware required by your application to works.
     * @returns {Server}
     */
    public $beforeRoutesInit(): void | Promise<any> {
        this.app
            .use(compress({}))
            .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true
            }));
    }

    public $afterRoutesInit() {
        this.app.use(NotFoundMiddleware);
    }
}
