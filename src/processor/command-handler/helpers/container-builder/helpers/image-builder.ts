import ImageLimits from '../../../interfaces/image-limits.inteface.ts';

class ImageBuilder {

    private readonly maxInitialImageWidth: number;
    private readonly maxInitialImageHeight: number;
    private readonly maxLargeImageWidth: number;
    private readonly maxLargeImageHeight: number;
    private readonly minResolutionDifference: number;

    constructor(imageLimits: ImageLimits) {
        this.maxInitialImageWidth = imageLimits.maxInitialImageWidth;
        this.maxInitialImageHeight = imageLimits.maxInitialImageHeight;
        this.maxLargeImageWidth = imageLimits.maxLargeImageWidth;
        this.maxLargeImageHeight = imageLimits.maxLargeImageHeight;
        this.minResolutionDifference = imageLimits.minResolutionDifference;
    }

    public async create(fileInput: HTMLInputElement, userWantsLargeImage: boolean): Promise<HTMLElement | undefined> {

        if (!fileInput.files || !fileInput.files[0]) return;

        const img = await this.readImage(fileInput.files[0]);
        if (!img) return;

        const initialImage: string = this.createInitialImage(img);
        const largeImage: string | undefined = userWantsLargeImage ? this.createLargeImage(img) : undefined;
        const newImage = document.createElement('img');
        newImage.src = initialImage;
        newImage.dataset.largeImage = largeImage;
        return newImage;
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

    private async readImage(file: File): Promise<HTMLImageElement | void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                if (e.target) {
                    const originalImageDataUrl = e.target.result as string;
                    const img = new Image();
                    img.src = originalImageDataUrl;

                    img.onload = function () {
                        resolve(img);
                    };

                    img.onerror = function () {
                        reject(new Error('Error al cargar la imágen'));
                    };
                }
            };

            reader.readAsDataURL(file);
        });
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