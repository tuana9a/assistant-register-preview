export function reformatString(input: any): string {
    try {
        let result = input.trim().replace(/\s{2,}/g, ' ');
        return result;
    } catch (err) {
        return '';
    }
}
