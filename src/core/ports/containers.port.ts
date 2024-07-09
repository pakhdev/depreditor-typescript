import ContainerProperties from '../containers/interfaces/container-properties.interface.ts';
import ContainerIdentifier from '../containers/identifier.ts';

class ContainersPort {
    public static(element: HTMLElement): ContainerProperties | null {
        return ContainerIdentifier.identify(element);
    }
}

export default ContainersPort;