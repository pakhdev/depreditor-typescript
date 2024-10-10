type DeferredSelection =
    | { type: 'before'; path: number[] }
    | { type: 'after'; path: number[] }
    | { type: 'caret'; path: number[]; offset: number }
    | { type: 'range'; startPath: number[]; endPath: number[] }
    | { type: 'inside'; path: number[] };

export default DeferredSelection;