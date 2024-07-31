import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface';
import ImageCreationProperties from './image-creation-properties.interface';
import TableCreationProperties from './table-creation-properties.interface';

type ElementCreationProperties = ContainerProperties | ImageCreationProperties | TableCreationProperties;

export default ElementCreationProperties;