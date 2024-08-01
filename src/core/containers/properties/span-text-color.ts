import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const spanTextColor: ContainerProperties = {
    tagName: 'span',
    types: [ContainerType.WRAPPER],
    styles: { color: '' },
};

export default spanTextColor;