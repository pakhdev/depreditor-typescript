import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const link: ContainerProperties = {
    tagName: 'a',
    types: [ContainerType.WRAPPER, ContainerType.INSERTABLE],
    attributes: { href: '' },
};

export default link;