import FragmentsFinder from '../utilities/fragments-finder/fragments-finder.ts';
import Core from '../../core/core.ts';
import TextBlock from '../utilities/fragments-finder/entities/text-block.ts';

class FragmentsFinderPort {

    private readonly fragmentsFinder: FragmentsFinder;

    constructor(private readonly core: Core) {
        this.fragmentsFinder = new FragmentsFinder(this.core);
    }

    public findTextBlocks(nodes: Node[]): TextBlock[] {
        return this.fragmentsFinder.findTextBlocks(nodes);
    }
}

export default FragmentsFinderPort;