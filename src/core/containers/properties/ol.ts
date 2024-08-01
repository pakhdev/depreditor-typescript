import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const ol: ContainerProperties = {
    tagName: 'ol',
    types: [ContainerType.WRAPPER, ContainerType.INSERTABLE],
    isBlock: true,
};

export default ol;