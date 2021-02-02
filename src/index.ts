import { parseDAETriangles } from './DAEParser';
import { rotateTriangleWithHypFirst, getBoxModel, getAffineTransformationMatrix, scale3x3 } from './triangles';
import { renderCSSTriangle } from './html';
import { Triangle3D } from './types';

export async function renderCSSTriangles(relativePath: string, scale: number, className: string) {
    const triangles = (await parseDAETriangles(relativePath))
            .map(rotateTriangleWithHypFirst)
            .map((targetTriangle) => {
                // scale up to px space
                const scaled = scale3x3(scale, targetTriangle);

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

                return renderCSSTriangle(box.height, box.borderLeft, box.borderRight, `matrix3d(${cssMatrixTransform})`, className);
            });
        return triangles;
}

export * from './html';