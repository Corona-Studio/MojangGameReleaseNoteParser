import ImageModel from "./imageModel";

export default class EntryModel {
    public title: string;
    public type: string;
    public version: string;
    public image: ImageModel;
    public body: string;
    public id: string;
}
