import Core from '../core/core.ts';
import CommandHandlerPort from './ports/command-handler.port.ts';
import FormattingReaderPort from './ports/formatting-reader.port.ts';
import HtmlBuilderPort from './ports/html-builder.port.ts';
import SelectionWorkspacePort from './ports/selection-workspace.port.ts';
import ImageLoaderPort from './ports/image-loader.port.ts';
import ImageBuilderPort from './ports/image-builder.port.ts';
import TableBuilderPort from './ports/table-builder.port.ts';
import FragmentsFinderPort from './ports/fragments-finder.port.ts';
import OperationsBuilderPort from './ports/operations-builder.port.ts';
import ElementWrapperPort from './ports/element-wrapper.port.ts';

class Processor {
    public imageLoader: ImageLoaderPort;
    public htmlBuilder: HtmlBuilderPort;
    public imageBuilder: ImageBuilderPort;
    public tableBuilder: TableBuilderPort;
    public formattingReader: FormattingReaderPort;
    public commandHandler: CommandHandlerPort;
    public fragmentsFinder: FragmentsFinderPort;
    public operationsBuilder: OperationsBuilderPort;
    public elementWrapper: ElementWrapperPort;

    constructor(public readonly core: Core) {
        this.imageLoader = new ImageLoaderPort();
        this.htmlBuilder = new HtmlBuilderPort();
        this.imageBuilder = new ImageBuilderPort();
        this.tableBuilder = new TableBuilderPort();
        this.formattingReader = new FormattingReaderPort(this.core);
        this.commandHandler = new CommandHandlerPort(this.core, this);
        this.fragmentsFinder = new FragmentsFinderPort(this.core);
        this.operationsBuilder = OperationsBuilderPort;
        this.elementWrapper = new ElementWrapperPort(this);
    }

    get selectionWorkspace(): SelectionWorkspacePort {
        return new SelectionWorkspacePort(this.core);
    }
}

export default Processor;