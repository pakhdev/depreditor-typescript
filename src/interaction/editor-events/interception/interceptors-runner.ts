import HandlingContext from '../../../processor/command-handler/interfaces/handling-context.interface.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';
import Core from '../../../core/core.ts';
import EditorEventConfig from '../interfaces/editor-event-config.interface.ts';
import EditorEventInterceptor from '../interfaces/editor-event-interceptor.interface.ts';
import Processor from '../../../processor/processor.ts';
import ContainerNodeInfo from '../interfaces/container-node-info.interface.ts';

class InterceptorsRunner {

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
    ) {}

    public run(eventConfig: EditorEventConfig, handlingContext: HandlingContext): boolean {
        const parentContainers: ContainerNodeInfo[] = this.getParentContainers();
        eventConfig.intercept?.forEach(({ containers, interceptors }) => {
            if (this.processInterceptorsForContainers(parentContainers, containers, interceptors, handlingContext))
                return true;
        });
        return false;
    }

    public processInterceptorsForContainers(
        parentContainers: ContainerNodeInfo[],
        targetContainers: ContainerProperties[],
        interceptors: EditorEventInterceptor[],
        handlingContext: HandlingContext,
    ): boolean {
        for (const parentContainer of parentContainers) {
            if (!targetContainers.includes(parentContainer.properties)) continue;
            for (const interceptor of interceptors) {
                if (interceptor(this.processor, parentContainer.node, handlingContext))
                    return true;
            }
        }
        return false;
    }

    private getParentContainers(): ContainerNodeInfo[] {
        const parentContainers: ContainerNodeInfo[] = [];
        const { commonAncestor, editableDiv } = this.core.selection.get(SelectionStateType.CURRENT);
        console.log(commonAncestor);
        let node: Node | null = commonAncestor.node;
        while (node && node !== editableDiv) {
            const element = node as HTMLElement;
            const containerProperties = this.core.containers.identify(element);
            if (containerProperties)
                parentContainers.push({ node, properties: containerProperties });
            node = node.parentNode;
        }
        return parentContainers;
    }
}

export default InterceptorsRunner;