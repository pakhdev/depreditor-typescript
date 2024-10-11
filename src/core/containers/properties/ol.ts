import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';
import li from './li.ts';

const ol: ContainerProperties = {
    tagName: 'ol',
    types: [ContainerType.INSERTABLE],
    isBlock: true,
    childContainer: li,
};

export default ol;