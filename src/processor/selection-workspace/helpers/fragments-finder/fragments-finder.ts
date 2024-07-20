import FindTextBlocks from './helpers/find-text-blocks.ts';

class FragmentsFinder {

    public static findTextBlocks(nodes: Node[]) {
        return new FindTextBlocks().from(nodes);
    }

}

export default FragmentsFinder;