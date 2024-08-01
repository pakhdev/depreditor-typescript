import ContainerProperties from '../interfaces/container-properties.interface.ts';
import ContainerType from '../enums/container-type.enum.ts';

const table: ContainerProperties = {
    tagName: 'table',
    types: [ContainerType.INSERTABLE],
    isBlock: true,
};

export default table;