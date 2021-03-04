export function reformatString(input: any): string {
    try {
        let result: string = input.trim().replace(/\s{2,}/g, ' ');
        return (result.match(/^null$/i) || result.match(/^undefined$/i)) ? '' : result;
    } catch (err) {
        return '';
    }
}
