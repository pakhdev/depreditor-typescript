import CommandHandler from './command-handler/command-handler.ts';
import CommandHandlerPort from './ports/command-handler.port.ts';
import Core from '../core/core.ts';
import FormattingReader from './utilities/formatting-reader/formatting-reader.ts';
import FormattingReaderPort from './ports/formatting-reader.port.ts';
import HtmlBuilderPort from './ports/html-builder.port.ts';

class Processor {
    public htmlBuilder: HtmlBuilderPort;
    public formattingReader: FormattingReaderPort;
    public commandHandler: CommandHandlerPort;

    constructor(private readonly core: Core) {
        const formattingReader = new FormattingReader(this.core);
        const commandHandler = new CommandHandler(this.core);

        this.htmlBuilder = new HtmlBuilderPort();
        this.formattingReader = new FormattingReaderPort(formattingReader);
        this.commandHandler = new CommandHandlerPort(commandHandler);
    }
}

export default Processor;