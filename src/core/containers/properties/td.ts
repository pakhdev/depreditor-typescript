import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const td: ContainerProperties = {
    tagName: 'td',
    types: [ContainerType.WRAPPER],
    keepIfEmpty: true,
};

export default td;