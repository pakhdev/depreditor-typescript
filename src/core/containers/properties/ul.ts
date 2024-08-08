import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';
import li from './li.ts';

const ul: ContainerProperties = {
    tagName: 'ul',
    types: [ContainerType.WRAPPER, ContainerType.INSERTABLE],
    childContainer: li,
};

export default ul;