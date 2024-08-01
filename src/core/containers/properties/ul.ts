import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const ul: ContainerProperties = {
    tagName: 'ul',
    types: [ContainerType.WRAPPER, ContainerType.INSERTABLE],
};

export default ul;