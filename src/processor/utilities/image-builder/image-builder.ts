import editorConfig from '../../../editor-config/editor-config.ts';

class ImageBuilder {

    private readonly maxInitialImageWidth: number;
    private readonly maxInitialImageHeight: number;
    private readonly maxLargeImageWidth: number;
    private readonly maxLargeImageHeight: number;
    private readonly minResolutionDifference: number;

    constructor() {
        const { images: imagesConfig } = editorConfig;
        this.maxInitialImageWidth = imagesConfig.maxInitialImageWidth;
        this.maxInitialImageHeight = imagesConfig.maxInitialImageHeight;
        this.maxLargeImageWidth = imagesConfig.maxLargeImageWidth;
        this.maxLargeImageHeight = imagesConfig.maxLargeImageHeight;
        this.minResolutionDifference = imagesConfig.minResolutionDifference;
    }

    public create(inputImages: HTMLImageElement[], userWantsLargeImage: boolean): HTMLElement[] {
        const images: HTMLElement[] = [];
        for (const inputImage of inputImages) {
            const initialImage: string = this.createInitialImage(inputImage);
            const largeImage: string | undefined = userWantsLargeImage ? this.createLargeImage(inputImage) : undefined;
            const newImage = document.createElement('img');
            newImage.src = initialImage;
            if (largeImage)
                newImage.dataset.largeImage = largeImage;
            images.push(newImage);
        }
        return images;
    }

    private createInitialImage(img: HTMLImageElement): string {
        if (img.width <= this.maxInitialImageWidth && img.height <= this.maxInitialImageHeight) {
            return img.src;
        }
        return this.resizeImage(img, this.maxInitialImageWidth, this.maxInitialImageHeight);
    }

    private createLargeImage(img: HTMLImageElement): string | undefined {

        if (img.width > this.maxInitialImageWidth + this.minResolutionDifference
            ||
            img.height > this.maxInitialImageHeight + this.minResolutionDifference
        ) {
            return this.resizeImage(img, this.maxLargeImageWidth, this.maxLargeImageHeight);
        }
        return;
    }

    private resizeImage(img: HTMLImageElement, maxWidth: number, maxHeight: number): string {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/jpeg');
    }
}

export default ImageBuilder;