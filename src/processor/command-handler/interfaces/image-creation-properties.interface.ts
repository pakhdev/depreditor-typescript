import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import ImageLimits from './image-limits.inteface.ts';

interface ImageCreationProperties extends ContainerProperties {
    tagName: 'image',
    creationParams: {
        fileInput: HTMLInputElement,
        userWantsLargeImage: boolean,
        imageLimits: ImageLimits
    }
}

export default ImageCreationProperties;