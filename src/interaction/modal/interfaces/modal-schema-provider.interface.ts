import ModalSchema from './modal-schema.interface.ts';

interface ModalSchemaProvider {
    getSchema(type?: string): ModalSchema;
}

export default ModalSchemaProvider;