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
} from './container-properties';
import { ContainerProperties } from './interfaces/container-properties.interface.ts';

// Clase que contiene las propiedades de los contenedores para poder
// ser utilizadas al crear e identificar un contenedor. También se utiliza
// para definir las acciones que se activaran al interactuar con el contenedor.
export const containersConfig: { [key: string]: ContainerProperties } = {
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