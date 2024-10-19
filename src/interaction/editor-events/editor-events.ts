import Core from '../../core/core.ts';
import HandlingContext from '../../processor/command-handler/interfaces/handling-context.interface.ts';
import Interaction from '../interaction.ts';
import InterceptorsRunner from './interception/interceptors-runner.ts';
import Processor from '../../processor/processor.ts';
import editorEventsConfig from './config/editor-events.config.ts';
import EditorEventConfig from './interfaces/editor-event-config.interface.ts';

class EditorEvents {
    private readonly eventsConfig: EditorEventConfig[] = editorEventsConfig;

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
        private readonly interaction: Interaction,
    ) {
        this.registerHandlers();
    }

    private registerHandlers(): void {
        this.eventsConfig.forEach(eventConfig => {
            this.core.eventHooks.on(eventConfig.hooks, (event) => this.handleHook(event!, eventConfig));
        });
    }

    private handleHook(event: Event, eventConfig: EditorEventConfig): void {
        const handlingContext: HandlingContext = {};
        if (new InterceptorsRunner(this.core, this.processor).run(eventConfig, handlingContext))
            return;
        eventConfig.method(event, this.processor, this.interaction, handlingContext);
    }
}

export default EditorEvents;