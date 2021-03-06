import { adjugate3x3, cross3D, determinant3x3, dot3D, getBoxModel, identity3x3, inverse3x3, Matrix3x3, multiply3x3, perpendicularDisector, transpose3x3 } from './triangles';
import { Triangle3D } from './types';

describe('helpers', () => {
    it('can find the determinant of a 3x3', () => {
        expect(
            determinant3x3([{ x: 1, y: 0, z: 5 }, { x: 2, y: 1, z: 6 }, { x: 3, y: 4, z: 0 }])
        ).toBe(1);
    });

    it('can transpose a 3x3', () => {
        expect(
            transpose3x3([{ x: 1, y: 0, z: 5 }, { x: 2, y: 1, z: 6 }, { x: 3, y: 4, z: 0 }])
        ).toEqual([{ x: 1, y: 2, z: 3 }, { x: 0, y: 1, z: 4 }, { x: 5, y: 6, z: 0 }]);
    });

    it('can create a adjugate matrix', () => {
        expect(
            adjugate3x3([{ x: 1, y: 0, z: 5 }, { x: 2, y: 1, z: 6 }, { x: 3, y: 4, z: 0 }])
        ).toEqual([{ x: -24, y: 20, z: -5 }, { x: 18, y: -15, z: 4 }, { x: 5, y: -4, z: 1 }]);
    });

    it('can find an inverse matrix', () => {
        const M: Matrix3x3 = [{ x: 1, y: 0, z: 5 }, { x: 2, y: 1, z: 6 }, { x: 3, y: 4, z: 0 }];
        const invM = inverse3x3(M);
        expect(multiply3x3(M, invM)).toEqual(identity3x3);
    });

    it('can find the dot product', () => {
        expect(dot3D({ x: 4, y: 8, z: 10 }, { x: 9, y: 2, z: 7 })).toEqual(122);
    });

    it('can find the cross product', () => {
        expect(cross3D({ x: 2, y: 3, z: 4 }, { x: 5, y: 6, z: 7 })).toEqual({ x: -3, y: 6, z: -3 });
    });

})

describe('perpendicularDisector()', () => {
    it('finds the midpont of a 1,1,√2 triangle', () => {
        // Flat triangle on the x,y plane
        const mockTriangle: Triangle3D = [
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 0, z: 0 },
        ];
        expect(
            perpendicularDisector(mockTriangle)
        ).toEqual({ x: 0.5, y: 0.5, z: 0 });
    });
})

describe('getBoxModel()', () => {
    it('finds the bounding box 1', () => {
        const { width, height, borderLeft, borderRight } = getBoxModel([
            { x: 0, y: 0, z: 0 },
            { x: 8, y: 0, z: 0 },
            { x: 2, y: 1, z: 0 }
        ]);
        expect(width).toBe(8)
        expect(height).toBe(1);
        expect(borderLeft).toBe(2);
        expect(borderRight).toBe(6);
    })
    it('finds the bounding box 2', () => {
        const { width, height, borderLeft, borderRight } = getBoxModel([
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 0, z: 0 },
        ]);
        expect(width).toBe(Math.sqrt(2))
        expect(height).toBe(Math.sqrt(2) / 2);
        expect(borderLeft).toBe(Math.sqrt(2) / 2);
        expect(borderRight).toBe(Math.sqrt(2) / 2);
    })
});
