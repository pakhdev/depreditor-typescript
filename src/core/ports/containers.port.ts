import ContainerProperties from '../containers/interfaces/container-properties.interface.ts';
import ContainerIdentifier from '../containers/identifier.ts';
import MatchingStatus from '../containers/enums/matching-status.enum.ts';

class ContainersPort {
    public static(element: HTMLElement): ContainerProperties | null {
        return ContainerIdentifier.identify(element);
    }

    public static areAttributesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): boolean {
        return ContainerIdentifier.areAttributesMatching(elementOrProperties, referenceProperties);
    }

    public static areClassesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): boolean {
        return ContainerIdentifier.areClassesMatching(elementOrProperties, referenceProperties);
    }
    
    public static areStylesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): MatchingStatus {
        return ContainerIdentifier.areStylesMatching(elementOrProperties, referenceProperties);
    }
}

export default ContainersPort;