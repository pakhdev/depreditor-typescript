import Styles from './styles.interface';
import Classes from './classes.interface';

interface Attributes {
    [key: string]: string | Styles | Classes | EventListenerOrEventListenerObject;
}

export default Attributes;