import { Styles } from './styles.interface';
import { Classes } from './classes.interface';

export interface Attributes {
    [key: string]: string | Styles | Classes | EventListenerOrEventListenerObject;
}