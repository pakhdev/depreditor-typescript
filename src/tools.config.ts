import { ContainerProps } from './types/container-props.type.ts';

export const toolsConfig: ContainerProps[] = [
    {
        name: 'bold',
        icon: 'icon-set-bold',
        tag: 'strong',
    },
    {
        name: 'italic',
        icon: 'icon-set-italic',
        tag: 'i',
    },
    {
        name: 'underline',
        icon: 'icon-set-underline',
        tag: 'u',
    },
    {
        name: 'code',
        icon: 'icon-set-code',
        tag: 'div',
        classes: ['code-text'],
    },
    {
        name: 'list-numbered',
        icon: 'icon-set-list-numbered',
        tag: 'ol',
    },
    {
        name: 'list-dots',
        icon: 'icon-set-list-dots',
        tag: 'ul',
    },
    {
        name: 'paragraph-left',
        icon: 'icon-set-paragraph-left',
        tag: 'div',
        styles: { textAlign: 'left' },
        groups: ['alignments'],
    },
    {
        name: 'paragraph-center',
        icon: 'icon-set-paragraph-center',
        tag: 'div',
        styles: { textAlign: 'center' },
        groups: ['alignments'],
    },
    {
        name: 'paragraph-right',
        icon: 'icon-set-paragraph-right',
        tag: 'div',
        styles: { textAlign: 'right' },
        groups: ['alignments'],
    },
    {
        name: 'hidden',
        icon: 'icon-set-hidden',
        tag: 'div',
        classes: ['hidden-text'],
    },
    {
        name: 'table',
        icon: 'icon-insert-table',
        tag: 'table',
    },
    {
        name: 'link',
        icon: 'icon-insert-link',
        tag: 'a',
        attributes: { href: '' },
    },
    {
        name: 'image',
        icon: 'icon-insert-image',
        tag: 'img',
        attributes: { src: '' },
    },
    {
        name: 'text-color',
        icon: 'icon-set-text-color',
        tag: 'span',
        styles: { color: '' },
    },
    {
        name: 'text-background-color',
        icon: 'icon-set-text-background-color',
        tag: 'span',
        styles: { backgroundColor: '' },
    },
];