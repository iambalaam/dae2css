# dae2css

Parses `.dae` Collada files and converts them into _[CSS Triangles](https://css-tricks.com/snippets/css/css-triangle/)_.

## Usage
`renderCSSTriangles()` returns a promise that resolves to the html containing all triangles as a string.
``` js
import { renderCSSTriangles, requiredCSSRules } from 'dae2css';
const triangles = await renderCSSTriangles('models/icosphere.dae', 100, 'my-3d-model');
```
You will also need to ensure that the required CSS rules are on the page
``` js
`.my-3d-model {
    ${requiredCSSRules}
}`
```