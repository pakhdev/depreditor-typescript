import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const image: ContainerProperties = {
    tagName: 'img',
    types: [ContainerType.INSERTABLE],
    isBlock: true,
    attributes: { src: '' },
};

export default image;
