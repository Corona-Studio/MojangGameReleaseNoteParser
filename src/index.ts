import HttpHelper from "./helper/httpHelper";
import UaHelper from "./helper/uaHelper";
import * as Consola from "consola";
import FileHelper from "./helper/fileHelper";
import ConfigModel from "./models/configModel";
import {Server} from "./server";
import {PlatformExpress} from "@tsed/platform-express";
import ReleaseNoteModel from "./models/releaseNoteModel";
import EntryModel from "./models/entryModel";
import HtmlHelper from "./helper/htmlHelper";

const apiUrl = "https://launchercontent.mojang.com/javaPatchNotes.json";

async function runCheckLoop(): Promise<void> {
    checkLoop().catch(err => {
        Consola.error("Failed to fetch news.")
        Consola.error(err);
    });
}

async function checkLoop(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        Consola.info("Starting fetching release notes....");

        let result: ReleaseNoteModel = new ReleaseNoteModel();

        const header = {
            "User-Agent": UaHelper.GetRandomUa()
        };
        const content = await HttpHelper.getRequest(apiUrl, header, false).catch((err) => {
            return reject(err);
        });
        const rawRn = JSON.parse(content as string) as ReleaseNoteModel;
        result.version = rawRn.version;
        result.entries = new Array<EntryModel>();

        for(let entry of rawRn.entries) {
            let resolvedBody = HtmlHelper.toFlowDocument(entry.body);

            let resultEntry = entry;
            resultEntry.image.url = `https://launchercontent.mojang.com${entry.image.url}`;
            resultEntry.body = resolvedBody;
            result.entries.push(resultEntry);
        }

        await FileHelper.writeFile(`${__dirname}/cache/rN.json`, JSON.stringify(result), "w+");
        Consola.success("Release notes fetch succeeded");
    });
}

async function entry(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        Consola.start("Starting release notes Fetch Server....");
        Consola.info("Reading config....");

        if (!await FileHelper.isFileExists("../config.json").catch(err => reject(err))) {
            Consola.error("Can not read file [config.json], please put this file to the path that same as [index.js] file!");
            process.exit(-1);
        }

        let config: ConfigModel = JSON.parse(await FileHelper.readFile("../config.json"));
        Consola.success("Fetching config succeeded");

        Consola.info(`Starting api server on port: ${config.port}`);
        try {
            const server = await PlatformExpress.bootstrap(Server, {port: config.port});
            await server.listen();
            Consola.success("Server initialized");
        } catch (e) {
            Consola.error(e);
            process.exit(-1);
        }

        await runCheckLoop();
        setInterval(runCheckLoop, config.checkInterval);
    });
}

entry().catch(err => {
    Consola.error(err);
});
