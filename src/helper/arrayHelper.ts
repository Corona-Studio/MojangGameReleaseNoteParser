export default class ArrayHelper extends Array{
    public remove(val: any): void {
        let index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    }
}
