class ImageLoader {

    public static async load(files: File[]): Promise<HTMLImageElement[]> {
        return Promise.all(files.map(file => this.readImage(file)));
    }

    private static readImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Error al cargar la imágen'));
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }
}

export default ImageLoader;
