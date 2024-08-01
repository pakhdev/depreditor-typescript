import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const divAlignRight: ContainerProperties = {
    tagName: 'div',
    types: [ContainerType.INSERTABLE, ContainerType.WRAPPER],
    isBlock: true,
    keepIfEmpty: true,
    styles: { textAlign: 'right' },
};

export default divAlignRight;