import RedirectArgs from './redirect-args.interface.ts';
import Operation from '../operation.ts';

interface RedirectEntry {
    operation: Operation;
    data: RedirectArgs;
}

export default RedirectEntry;