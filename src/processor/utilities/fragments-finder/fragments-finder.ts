import FindTextBlocks from './utilities/find-text-blocks.ts';
import Core from '../../../core/core.ts';
import TextBlock from './entities/text-block.ts';

class FragmentsFinder {
    constructor(private core: Core) {}

    public findTextBlocks(nodes: Node[]): TextBlock[] {
        return new FindTextBlocks(this.core).from(nodes);
    }

}

export default FragmentsFinder;