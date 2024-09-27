import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

interface ImageCreationProperties extends ContainerProperties {
    tagName: 'img',
    creationParams: {
        images: HTMLImageElement[],
        userWantsLargeImage: boolean,
    }
}

export default ImageCreationProperties;