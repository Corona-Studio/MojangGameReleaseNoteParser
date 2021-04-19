import {JSDOM} from "jsdom";

export default class HtmlHelper{
    static toFlowDocument(body: string) : string{
        const dom = new JSDOM(body, {contentType: "text/html"}).window.document;
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

            if(!flag && nodeType !== "UL" && nodeType !== "OL" && nodeType !== "TABLE"){
                flag = true;
                resolvedBody += "<Paragraph>";
            }

            if(nodeType === "UL" || nodeType === "OL" || nodeType === "TABLE"){
                resolvedBody += "</Paragraph>";
                flag = false;
            }

            resolvedBody = HtmlHelper.resolveNode(resolvedBody, childNode, nodeType);
        }

        if(flag)
            resolvedBody += "</Paragraph>";

        resolvedBody = resolvedBody.replace(/&/g, '&amp;');
        resolvedBody += "</FlowDocument>";

        return resolvedBody;
    }

    private static resolveNode(rB: string, node: ChildNode, nodeType: string): string {
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
                    let hrefContent =  (node as Element).getAttribute("href");
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
                case "COLOR":
                case "COLOUR":
                    leadingTag = `&lt;colour&gt;`;
                    break;
                case "MOB":
                    leadingTag = `&lt;mob&gt;`;
                    break;
                case "EM":
                    leadingTag = `<TextBlock FontWeight="Bold" Foreground="{DynamicResource LauncherX.AccentColor.Lighter}">`;
                    endingTag = "</TextBlock>";
                    break;
                case "TABLE":
                    leadingTag = "<Table>";
                    endingTag = "</Table>";
                    break;
                case "TH":
                    leadingTag = `<TableCell FontWeight="Bold" FontSize="{DynamicResource LauncherX.FontSize.Title}">`;
                    endingTag = "</TableCell>";
                    break;
                case "TR":
                    leadingTag = "<TableRow>";
                    endingTag = "</TableRow>";
                    break;
                case "THEAD":
                case "TBODY":
                    leadingTag = `<TableRowGroup>`;
                    endingTag = `</TableRowGroup>`;
                    break;
                case "TD":
                    leadingTag = `<TableCell>`;
                    endingTag = "</TableCell>";
                    break;
                case "BR":
                    leadingTag = "<LineBreak>";
                    endingTag = "</LineBreak>"
                    break;
                case "IMG":
                    let element = node as Element;
                    let srcContent =  element.getAttribute("src");
                    let hasWidth = element.hasAttribute("width");
                    let hasHeight = element.hasAttribute("height");

                    let widthContent = hasWidth ? element.getAttribute("width") : 350;
                    let heightContent = hasHeight ? element.getAttribute("height") : 110;

                    leadingTag = `<Image Source="${srcContent}" Width="${widthContent}" Height="${heightContent}">`;
                    endingTag = "</Image>";
                    break;
            }

            rB += leadingTag;

            let flag = false;
            for(let nI = 0; nI < node.childNodes.length; nI++){
                const childNodeType = node.childNodes[nI].nodeName;

                if(["OL", "UL", "P", "H1",
                    "H2", "H3", "H4", "H5",
                    "A", "CODE", "STRONG", "PRE",
                    "COLOUR", "COLOR", "EM", "TABLE", "TR",
                    "THEAD", "TBODY", "MOB", "BR", "IMG"].indexOf(nodeType) === -1 && !flag){
                    flag = true;
                    rB += "<Paragraph>";
                }

                if((childNodeType === "UL" || childNodeType === "OL" || childNodeType === "TABLE") && flag){
                    flag = false;
                    rB += "</Paragraph>";
                }

                rB = HtmlHelper.resolveNode(rB, node.childNodes[nI], childNodeType);
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
}
