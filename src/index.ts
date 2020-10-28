import HttpHelper from "./helper/httpHelper";
import UaHelper from "./helper/uaHelper";
import * as Consola from "consola";
import {JSDOM} from "jsdom";
import FileHelper from "./helper/fileHelper";
import ConfigModel from "./models/configModel";
import {Server} from "./server";
import {PlatformExpress} from "@tsed/platform-express";
import ReleaseNoteModel from "./models/releaseNoteModel";
import EntryModel from "./models/entryModel";

const apiUrl = "https://launchercontent.mojang.com/javaPatchNotes.json";

async function checkLoop(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        Consola.info("Starting fetching release notes....");

        let result: ReleaseNoteModel = new ReleaseNoteModel();

        const header = {
            "User-Agent": UaHelper.GetRandomUa()
        };
        const content = await HttpHelper.getRequest(apiUrl, header, false).catch((err) => reject(err));
        const rawRn = JSON.parse(content as string) as ReleaseNoteModel;
        result.version = rawRn.version;
        result.entries = new Array<EntryModel>();

        function resolveNode(rB: string, node: ChildNode, nodeType: string): string {
            if(node.hasChildNodes() && nodeType !== "#text"){
                let leadingTag = "";
                let endingTag = "";

                switch (nodeType) {
                    case "P":
                        leadingTag = `<TextBlock Padding="0,5" TextWrapping="Wrap" FontSize="{DynamicResource LauncherX.FontSize.NormalText}">`;
                        endingTag = "</TextBlock>";
                        break;
                    case "H1":
                        leadingTag = `<LineBreak/><TextBlock Padding="0,10" TextWrapping="Wrap" FontSize="{DynamicResource LauncherX.FontSize.Title}">`;
                        endingTag = "</TextBlock>";
                        break;
                    case "H2":
                    case "H3":
                    case "H4":
                    case "H5":
                        leadingTag = `<LineBreak/><TextBlock Padding="0,10" TextWrapping="Wrap" FontSize="{DynamicResource LauncherX.FontSize.Title.Secondary}">`;
                        endingTag = "</TextBlock>";
                        break;
                    case "OL":
                    case "UL":
                        leadingTag = "<List>";
                        endingTag = "</List>";
                        break;
                    case "LI":
                        leadingTag = "<ListItem>";
                        endingTag = "</ListItem>";
                        break;
                    case "A":
                        const hrefContent =  (node as Element).getAttribute("href");
                        leadingTag = "<Hyperlink>" +
                                        "<b:Interaction.Triggers>" +
                                            `<b:EventTrigger EventName="Click">` +
                                                "<b:LaunchUriOrFileAction " +
                                                    `Path="${hrefContent}" />` +
                                            "</b:EventTrigger>" +
                                        "</b:Interaction.Triggers>";
                        endingTag = "</Hyperlink>";
                        break;
                    case "CODE":
                        leadingTag = `<TextBlock FontWeight="Bold" FontStyle="Italic">`;
                        endingTag = "</TextBlock>";
                        break;
                    case "STRONG":
                        leadingTag = `<TextBlock FontWeight="Bold">`;
                        endingTag = "</TextBlock>";
                        break;
                    case "PRE":
                        leadingTag = `<TextBlock TextDecorations="Underline">`;
                        endingTag = "</TextBlock>";
                        break;
                    case "COLOUR":
                        leadingTag = `&lt;colour&gt;`;
                        break;
                    case "EM":
                        leadingTag = `<TextBlock FontWeight="Bold" Foreground="{DynamicResource LauncherX.AccentColor.Lighter}">`;
                        endingTag = "</TextBlock>";
                        break;
                }

                rB += leadingTag;

                let flag = false;
                for(let nI = 0; nI < node.childNodes.length; nI++){
                    const childNodeType = node.childNodes[nI].nodeName;

                    if(["OL", "UL", "P", "H1",
                        "H2", "H3", "H4", "H5",
                        "A", "CODE", "STRONG", "PRE",
                        "COLOUR", "EM"].indexOf(nodeType) === -1 && !flag){
                        flag = true;
                        rB += "<Paragraph>";
                    }

                    if((childNodeType === "UL" || childNodeType === "OL") && flag){
                        flag = false;
                        rB += "</Paragraph>";
                    }

                    rB = resolveNode(rB, node.childNodes[nI], childNodeType);
                }

                if(flag)
                    rB += "</Paragraph>";

                rB += endingTag;
            }
            else{
                const value = node.textContent;
                switch (nodeType) {
                    case "P":
                    case "H1":
                    case "H2":
                    case "H3":
                    case "H4":
                    case "H5":
                        rB += value;
                        break;
                    case "#text":
                        if(value !== "\n")
                            rB += value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<LineBreak/>");
                }
            }

            return rB;
        }

        for(let entry of rawRn.entries) {
            const dom = new JSDOM(entry.body, {contentType: "text/html"}).window.document;
            const htmlTag = dom.childNodes[0];
            const bodyTag = htmlTag.childNodes[1];

            let resolvedBody = "<FlowDocument " +
                                    `xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" ` +
                                    `xmlns:b="http://schemas.microsoft.com/xaml/behaviors" ` +
                                    `xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" ` +
                                    `Foreground="{DynamicResource LauncherX.Foreground.Primary}">`;

            let flag = false;
            for(let i = 0; i < bodyTag.childNodes.length; i++){
                const childNode = bodyTag.childNodes[i];
                const nodeType = childNode.nodeName;

                if(!flag && nodeType !== "UL" && nodeType !== "OL"){
                    flag = true;
                    resolvedBody += "<Paragraph>";
                }

                if(nodeType === "UL" || nodeType === "OL"){
                    resolvedBody += "</Paragraph>";
                    flag = false;
                }

                resolvedBody = resolveNode(resolvedBody, childNode, nodeType);
            }

            if(flag)
                resolvedBody += "</Paragraph>";

            resolvedBody = resolvedBody.replace(/&/g, '&amp;');
            resolvedBody += "</FlowDocument>";

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

        checkLoop();
        setInterval(checkLoop, config.checkInterval);
    });
}

entry().catch(err => {
    Consola.error(err);
});
