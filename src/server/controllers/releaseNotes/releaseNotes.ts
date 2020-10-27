import {Controller, Get, PathParams} from "@tsed/common";
import FileHelper from "../../../helper/fileHelper";
import {BadRequest} from "ts-httpexceptions";
import ReleaseNoteModel from "../../../models/releaseNoteModel";
import EntryModel from "../../../models/entryModel";

const jsonPath = "../cache/rN.json";

@Controller("/api/rN")
export class NewsApi {
    /**
     * Get Release Note Default (All of them)
     * @return release note object
     */
    @Get("/")
    async getNewsDefault(): Promise<any> {
        if(await FileHelper.isFileExists(jsonPath)){
            const content = await FileHelper.readFile(jsonPath);
            return JSON.parse(content) as ReleaseNoteModel;
        }
        else{
            return new BadRequest("Release note did not found");
        }
    }

    /**
     * Get different type of release notes by type argument
     * @param type
     */
    @Get("/:type")
    async getCountNews(@PathParams("type") type: string): Promise<any> {
        if(await FileHelper.isFileExists(jsonPath)){
            const content = await FileHelper.readFile(jsonPath);
            const contentModel = JSON.parse(content) as ReleaseNoteModel;

            if(type !== "release" && type !== "snapshot"){
                return new BadRequest("Type is not defined.");
            }

            const resultEntries = new Array<EntryModel>();
            for(const model of contentModel.entries){
                if(model.type === type)
                    resultEntries.push(model);
            }

            let result  = contentModel;
            result.entries = resultEntries;
            return result;
        }
        else{
            return new BadRequest("Release note did not found");
        }
    }
}
