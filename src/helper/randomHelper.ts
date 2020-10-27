export default class RandomHelper {
    static randomSample<T>(arr: Array<T>): T{
        if(arr.length === 0) return null;

        return arr[this.randomInteger(0, arr.length - 1)];
    }

    static randomInteger(min: number, max: number): number{
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
