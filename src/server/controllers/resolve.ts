import {BodyParams, Controller, Post} from "@tsed/common";
import HtmlHelper from "../../helper/htmlHelper";

@Controller("/api/resolve")
export class VersionApi {
    /**
     * Get Api Version
     *
     * @returns {{name: string, name: string, description: string, requestId: string}}
     * @param payload
     */
    @Post("/html")
    getVersion(@BodyParams() payload: any) {
        return HtmlHelper.toFlowDocument(payload.content);
    }
}
