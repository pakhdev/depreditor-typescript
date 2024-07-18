import ContainerProperties from '../containers/interfaces/container-properties.interface.ts';
import ContainerIdentifier from '../containers/identifier.ts';
import MatchingStatus from '../containers/enums/matching-status.enum.ts';

class ContainersPort {
    public identify(element: HTMLElement | Node): ContainerProperties | null {
        return ContainerIdentifier.identify(element);
    }

    public areAttributesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): boolean {
        return ContainerIdentifier.areAttributesMatching(elementOrProperties, referenceProperties);
    }

    public areClassesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): boolean {
        return ContainerIdentifier.areClassesMatching(elementOrProperties, referenceProperties);
    }

    public areStylesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): MatchingStatus {
        return ContainerIdentifier.areStylesMatching(elementOrProperties, referenceProperties);
    }
}

export default ContainersPort;