import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

interface TableCreationProperties extends ContainerProperties {
    tagName: 'table',
    creationParams: {
        rows: number;
        cols: number;
    }
}

export default TableCreationProperties;