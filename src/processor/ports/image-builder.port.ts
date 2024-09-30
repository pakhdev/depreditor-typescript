import ImageBuilder from '../utilities/image-builder/image-builder.ts';

class ImageBuilderPort {
    private readonly imageBuilder: ImageBuilder = new ImageBuilder();

    public create(inputImages: HTMLImageElement[], userWantsLargeImage: boolean): HTMLElement[] {
        return this.imageBuilder.create(inputImages, userWantsLargeImage);
    }
}

export default ImageBuilderPort;