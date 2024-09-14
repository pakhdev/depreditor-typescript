import ModalSchemaProvider from './modal-schema-provider.interface.ts';

interface ModalSchemaConfig {
    [key: string]: ModalSchemaEntry;
}

interface ModalSchemaEntry {
    provider: ModalSchemaProvider;
    type?: string;
}

export default ModalSchemaConfig;