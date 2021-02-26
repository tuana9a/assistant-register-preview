export function fromMapToArray_Value(map: Map<any, any>) {
    return Array.from(map, ([_key, value]) => value);
}
export function fromSetToArray(set: Set<any>) {
    return Array.from(set);
}
export function fromAnyToNumber(input: any): number {
    try {
        let value = parseInt(input);
        return value ? value : 0;
    } catch (err) {
        return 0;
    }
}
