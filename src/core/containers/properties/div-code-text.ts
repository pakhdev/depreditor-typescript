import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const divCodeText: ContainerProperties = {
    tagName: 'div',
    types: [ContainerType.INSERTABLE, ContainerType.WRAPPER],
    isBlock: true,
    classes: ['code-text'],
};

export default divCodeText;