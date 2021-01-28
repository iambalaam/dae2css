import { Triangle3D, Vector3d } from './types';

// Vector helpers
export function scale3D(s: number, v: Vector3d) {
    return { x: s * v.x, y: s * v.y, z: s * v.z };
}
export function add3D(v1: Vector3d, v2: Vector3d): Vector3d {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}
export function subtract3D(v1: Vector3d, v2: Vector3d): Vector3d {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
}
export function dot3D(v1: Vector3d, v2: Vector3d): number {
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z)
}

export function disectTriangle(triangle: Triangle3D) {
    // Find hypotenuse
    const lineLenghts = triangle.map((v1, i) => {
        const v2 = triangle[(i + 1) % 3];
        return Math.hypot(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
    });

    let maxLength = 0;
    let longestLineIndex;
    for (let i = 0; i < 3; i++) {
        if (lineLenghts[i] > maxLength) {
            maxLength = lineLenghts[i];
            longestLineIndex = i; // Hypotenuse is from v[i] to v[i+1]
        }
    }

    // Find perpendicular disector to 3rd vertex
    // Because it is from the hypotenuse, the disector must be inside the triangle

    const v = triangle;
    const i = longestLineIndex;

    console.log(`Line index: ${i}`);

    // Let be the normal vector n = v[2] - v[1]

    const n = subtract3D(v[(i + 1) % 3], v[i]);
    // Line L = v[i] + λn



    // Plane ∏ with normal vector n passes through v[i+2]
    // So a point X on plane ∏ can be described:
    // n . v[i+2] = n . X = μ
    const μ = dot3D(n, v[(i + 2) % 3]);

    // Use equations for ∏ and L:
    const λ = (μ - dot3D(n, v[i])) / dot3D(n, n);

    // We have solved for point X
    const X = add3D(v[i], scale3D(λ, n));

    // We must be careful to preserve order of vertices
    // Triangles have a counter-clockwise direction
    // We also always have X (our right angle) as the middle vertex 
    const triangles: Triangle3D[] = [
        [v[i], X, v[(i + 2) % 3]],
        [v[(i + 2) % 3], X, v[(i + 1) % 3]]
    ];

    return triangles;
}