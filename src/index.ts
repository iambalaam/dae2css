import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { parseDAETriangles } from './DAEParser';
import { rotateTriangleWithHypFirst, getBoxModel, getAffineTransformationMatrix, scale3x3 } from './triangles';
import { createTemplate, renderCSSTriangle } from './html';
import { Triangle3D } from './types';

(async () => {
    const triangles = (await parseDAETriangles('mocks/cube.dae'))
        .map(rotateTriangleWithHypFirst)
        .map((targetTriangle) => {
            // scale up to px space
            const scaled = scale3x3(100, targetTriangle);

            const box = getBoxModel(scaled);
            const initialTriangle: Triangle3D = [
                { x: 0, y: 0, z: 0 },
                { x: box.width, y: 0, z: 0 },
                { x: box.borderLeft, y: -box.height, z: 0 }
            ];
            const matrixTransform = getAffineTransformationMatrix(initialTriangle, scaled);
            const cssMatrixTransform = matrixTransform
                .map(({ x, y, z }, i) => `${x}, ${y}, ${z}, ${i < 3 ? 0 : 1}`)
                .join(',')

            return renderCSSTriangle(box.height, box.borderLeft, box.borderRight, `matrix3d(${cssMatrixTransform})`, 'triangle');
        });

    const htmlTemplate = createTemplate(triangles.join(''));
    writeFileSync(resolve(__dirname, 'index.html'), htmlTemplate);

})();