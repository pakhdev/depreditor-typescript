import { EditorInitializer } from './editor-Initializer.ts';

const firstContentEditableDiv = document.getElementById('editor-content')! as HTMLDivElement;
const firstToolbarContainer = document.getElementById('editor-toolbar__icons-container')!;

const secondContentEditableDiv = document.getElementById('editor-content-two')! as HTMLDivElement;
const secondToolbarContainer = document.getElementById('editor-toolbar__icons-container-two')!;

new EditorInitializer(firstContentEditableDiv, firstToolbarContainer);
new EditorInitializer(secondContentEditableDiv, secondToolbarContainer);