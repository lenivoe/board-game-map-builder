export default class FileReaderAsync {
    static readFromBlob(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    static readFromUrl(url: string): Promise<string> {
        return fetch(url)
            .then((response) => response.blob())
            .then((blob) => FileReaderAsync.readFromBlob(blob));
    }
}
