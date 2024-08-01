import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const spanTextBackgroundColor: ContainerProperties = {
    tagName: 'span',
    types: [ContainerType.WRAPPER],
    styles: { backgroundColor: '' },
};

export default spanTextBackgroundColor;