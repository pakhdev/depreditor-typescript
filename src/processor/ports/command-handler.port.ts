import ElementCreationProperties from '../command-handler/interfaces/element-creation-properties.interface.ts';
import CommandHandler from '../command-handler/command-handler.ts';

class CommandHandlerPort {
    constructor(private readonly commandHandler: CommandHandler) {}

    public execute(elementProperties: ElementCreationProperties) {
        return this.commandHandler.execute(elementProperties);
    }
}

export default CommandHandlerPort;