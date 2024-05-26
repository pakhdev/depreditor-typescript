import { ToolbarButton } from '../interfaces/toolbar-button.ts';

export const toolbarButtons: ToolbarButton[] = [
    {
        name: 'bold',
        icon: 'icon-set-bold',
    },
    {
        name: 'italic',
        icon: 'icon-set-italic',
    },
    {
        name: 'underline',
        icon: 'icon-set-underline',
    },
    {
        name: 'code',
        icon: 'icon-set-code',
    },
    {
        name: 'list-numbered',
        icon: 'icon-set-list-numbered',
    },
    {
        name: 'list-dots',
        icon: 'icon-set-list-dots',
    },
    {
        name: 'paragraph-left',
        icon: 'icon-set-paragraph-left',
    },
    {
        name: 'paragraph-center',
        icon: 'icon-set-paragraph-center',
    },
    {
        name: 'paragraph-right',
        icon: 'icon-set-paragraph-right',
    },
    {
        name: 'hidden',
        icon: 'icon-set-hidden',
    },
    {
        name: 'table',
        icon: 'icon-insert-table',
        requiresModal: true,
    },
    {
        name: 'link',
        icon: 'icon-insert-link',
        requiresModal: true,
    },
    {
        name: 'image',
        icon: 'icon-insert-image',
        requiresModal: true,
    },
    {
        name: 'text-color',
        icon: 'icon-set-text-color',
        requiresModal: true,
    },
    {
        name: 'text-background-color',
        icon: 'icon-set-text-background-color',
        requiresModal: true,
    },
];