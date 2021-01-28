import { disectTriangle } from './triangles';
import { Triangle3D } from './types';

it('cuts a triangle into 2', () => {
    // Flat triangle on the x,y plane
    const mockTriangle: Triangle3D = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
    ];
    expect(
        disectTriangle(mockTriangle)
    ).toEqual([
        [
            { x: 1, y: 0, z: 0 },
            { x: 0.5, y: 0.5, z: 0 },
            { x: 0, y: 0, z: 0 }
        ],
        [
            { x: 0, y: 0, z: 0 },
            { x: 0.5, y: 0.5, z: 0 },
            { x: 0, y: 1, z: 0 }
        ]
    ]);
});