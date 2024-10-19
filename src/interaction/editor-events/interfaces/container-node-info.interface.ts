import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

interface ContainerNodeInfo {
    node: Node;
    properties: ContainerProperties;
}

export default ContainerNodeInfo;