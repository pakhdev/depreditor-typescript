import { SelectionDetails } from './selection-details.interface.ts';

export interface SelectionPickArgs {
    selection: SelectionDetails,
    node?: Node,
    path?: number[],
    startFound?: boolean
}