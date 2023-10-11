# Depreditor
Creado por Mikhail Pakhmutov a.k.a. pakh.dev


El **Depreditor** es un editor personalizado desarrollado para el proyecto BrainCrate. Aunque inicialmente se creó para satisfacer las necesidades específicas de BrainCrate, el editor se ha desarrollado de manera independiente y podría convertirse en un módulo para Angular en el futuro.

La razón principal detrás de la creación de este editor en lugar de utilizar uno existente es la necesidad de tener un control total sobre sus características y funcionalidades. Esto permite que el editor se ajuste perfectamente a las necesidades del proyecto y pueda ser afinado en detalle a medida que evoluciona.

Quiero enfatizar que este editor es de código abierto y estoy totalmente abierto a que otros lo utilicen, modifiquen 
y desarrollen según sus necesidades. La comunidad de desarrolladores es bienvenida para contribuir y mejorar el editor.

Si decides utilizar o modificar el Depreditor, te animo a que lo hagas y lo adaptes a tus propios proyectos. 

## Uso Básico

El editor se puede integrar fácilmente en diferentes contenedores HTML. Pueden ser varios en la misma página Aquí 
hay un ejemplo de cómo 
llamar al editor:

```javascript
const firstContentEditableDiv = document.getElementById('editor-content')! as HTMLDivElement;
const firstToolbarContainer = document.getElementById('editor-toolbar__icons-container')!;
new EditorInitializer(firstContentEditableDiv, firstToolbarContainer);
```

También puedes probar el editor directamente desde el código en GitHub utilizando el comando:

```shell
npm run dev
```

## Características Principales:

El código del editor está dividido en varios módulos para facilitar su edición y mantenimiento. Hasta el momento, el editor incluye las siguientes funciones básicas:

* Formato de texto: negrita, cursiva, subrayado.
* Cambio de color de texto y fondo.
* Creación de listas ordenadas y no ordenadas.
* Alineación del texto.
* Inserción de tablas e imágenes.
* Procesamiento de Imágenes
* Una característica interesante del editor es el procesamiento automático de imágenes. Las imágenes se redimensionan automáticamente de acuerdo con las configuraciones establecidas en el módulo images-processor.ts. Puedes ajustar estas variables según tus necesidades:

```typescript
private maxInitialImageWidth: number = 800;
private maxInitialImageHeight: number = 600;
private minResolutionDifference: number = 300;
private maxLargeImageWidth: number = 1600;
private maxLargeImageHeight: number = 1200;
```
Las imágenes redimensionadas se insertan en el texto del editor en formato base64 y deben procesarse en el backend. Puedes desactivar la opción de crear imágenes grandes al subir imágenes.
La variable minResolutionDifference representa la diferencia mínima que debe existir entre la resolución de la imagen original (es decir, su ancho y alto) y la resolución de la imagen creada 
inicialmente, que será la que aparezca en tu artículo. En otras palabras, esta variable establece un umbral mínimo que debe superarse para decidir si es necesario crear una imagen adicional 
de mayor resolución que se mostrará como imagen inicial. Si la diferencia de resolución entre la imagen original y la imagen inicial es igual o mayor que el valor de minResolutionDifference, 
entonces se creará la imagen adicional de mayor resolución (si el usuario lo permite antes de subir la imágen); de lo contrario, se usará la imagen original como imagen inicial en tu artículo.

Para insertar imágenes en el código, se utiliza el siguiente formato:

```typescript
<img largeimage="data:image/jpeg;base64..." src="data:image/jpeg;base64...">
```

Donde el atributo largeimage contiene la imagen grande (si existe) y en caso contrario será null.