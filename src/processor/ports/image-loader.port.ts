import ImageLoader from '../utilities/image-loader/image-loader.ts';

class ImageLoaderPort {

    public load(files: File[]): Promise<HTMLImageElement[]> {
        return ImageLoader.load(files);
    }
    
}

export default ImageLoaderPort;