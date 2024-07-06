import { RedirectArgs } from './redirect-args.interface.ts';
import { Operation } from '../operation.ts';

export interface RedirectEntry {
    operation: Operation;
    redirect: RedirectArgs;
}