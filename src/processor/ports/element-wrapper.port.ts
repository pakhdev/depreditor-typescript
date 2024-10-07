import ElementWrapper from '../utilities/element-wrapper/element-wrapper.ts';
import Processor from '../processor.ts';
import ContainerProperties from '../../core/containers/interfaces/container-properties.interface.ts';

class ElementWrapperPort {

    private readonly elementWrapper: ElementWrapper;

    constructor(private readonly processor: Processor) {
        this.elementWrapper = new ElementWrapper(this.processor);
    }

    public wrap(nodes: Node[], wrapperElement: Node, containerProperties: ContainerProperties): Node[] {
        return this.elementWrapper.wrap(nodes, wrapperElement, containerProperties);
    }

    public unwrap(nodes: Node[], containerProperties: ContainerProperties): Node[] {
        return this.elementWrapper.unwrap(nodes, containerProperties);
    }
}

export default ElementWrapperPort;