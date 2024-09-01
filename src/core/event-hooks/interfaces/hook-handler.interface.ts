import Core from '../../core.ts';

interface HookHandler {
    (core: Core, event?: Event): void;
}

export default HookHandler;