import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const divHidden: ContainerProperties = {
    tagName: 'div',
    types: [ContainerType.WRAPPER],
    classes: ['hidden-text'],
};

export default divHidden;