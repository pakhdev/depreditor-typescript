import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import EditorEventInterceptor from './editor-event-interceptor.interface.ts';

interface EditorEventInterception {
    containers: ContainerProperties[];
    interceptors: EditorEventInterceptor[];
}

export default EditorEventInterception;