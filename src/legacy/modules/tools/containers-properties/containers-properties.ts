import {
    divAlignCenter,
    divAlignLeft,
    divAlignRight,
    divCodeText,
    divHidden,
    i, image, link,
    ol, spanTextBackgroundColor, spanTextColor,
    strong, table,
    u,
    ul,
} from './containers';
import { ContainerProperties } from '../interfaces';

// Clase que contiene las propiedades de los contenedores para poder
// ser utilizadas al crear e identificar un contenedor. También se utiliza
// para definir las acciones que se activaran al interactuar con el contenedor.
export const containersProperties: { [key: string]: ContainerProperties } = {
    divAlignCenter,
    divAlignLeft,
    divAlignRight,
    divCodeText,
    divHidden,
    i,
    image,
    link,
    ol,
    spanTextBackgroundColor,
    spanTextColor,
    strong,
    table,
    u,
    ul,
};