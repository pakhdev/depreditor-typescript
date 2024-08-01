import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const divAlignCenter: ContainerProperties = {
    tagName: 'div',
    types: [ContainerType.INSERTABLE, ContainerType.WRAPPER],
    isBlock: true,
    styles: { textAlign: 'center' },
};

export default divAlignCenter;