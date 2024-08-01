import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const li: ContainerProperties = {
    tagName: 'li',
    types: [ContainerType.WRAPPER],
    keepIfEmpty: true,
};

export default li;