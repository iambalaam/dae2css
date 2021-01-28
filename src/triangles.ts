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
export function magnitude3D(v: Vector3d) {
    return Math.hypot(v.x, v.y, v.z);
}
export function distance3D(v1: Vector3d, v2: Vector3d) {
    return magnitude3D(subtract3D(v2, v1));
}

// Matrix Helpers (using column vectors)
export type Matrix3x3 = [Vector3d, Vector3d, Vector3d];
export const identity3x3 = [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }];
export function scale3x3(s: number, M: Matrix3x3): Matrix3x3 {
    const [v1, v2, v3] = M;
    return [scale3D(s, v1), scale3D(s, v2), scale3D(s, v3)];
};

export function multiply3x3(A: Matrix3x3, B: Matrix3x3): Matrix3x3 {
    const [a1, a2, a3] = A;
    const [b1, b2, b3] = B;
    return [
        {
            x: (a1.x * b1.x) + (a2.x * b1.y) + (a3.x * b1.z),
            y: (a1.y * b1.x) + (a2.y * b1.y) + (a3.y * b1.z),
            z: (a1.z * b1.x) + (a2.z * b1.y) + (a3.z * b1.z),
        }, {
            x: (a1.x * b2.x) + (a2.x * b2.y) + (a3.x * b2.z),
            y: (a1.y * b2.x) + (a2.y * b2.y) + (a3.y * b2.z),
            z: (a1.z * b2.x) + (a2.z * b2.y) + (a3.z * b2.z),
        }, {
            x: (a1.x * b3.x) + (a2.x * b3.y) + (a3.x * b3.z),
            y: (a1.y * b3.x) + (a2.y * b3.y) + (a3.y * b3.z),
            z: (a1.z * b3.x) + (a2.z * b3.y) + (a3.z * b3.z),
        }
    ]
};

export function determinant3x3(M: Matrix3x3): number {
    const [v1, v2, v3] = M;
    return (
        v1.x * (v2.y * v3.z - v2.z * v3.y)
        - v2.x * (v1.y * v3.z - v1.z * v3.y)
        + v3.x * (v1.y * v2.z - v1.z * v2.y)
    );
};

export function transpose3x3(M: Matrix3x3): Matrix3x3 {
    const [v1, v2, v3] = M;
    return [
        { x: v1.x, y: v2.x, z: v3.x },
        { x: v1.y, y: v2.y, z: v3.y },
        { x: v1.z, y: v2.z, z: v3.z },
    ];
};

export function adjugate3x3(M: Matrix3x3): Matrix3x3 {
    const [v1, v2, v3] = transpose3x3(M);
    return [
        {
            x: (v2.y * v3.z - v2.z * v3.y),
            y: -(v2.x * v3.z - v2.z * v3.x),
            z: (v2.x * v3.y - v2.y * v3.x),
        }, {
            x: -(v1.y * v3.z - v1.z * v3.y),
            y: (v1.x * v3.z - v1.z * v3.x),
            z: -(v1.x * v3.y - v1.y * v3.x),
        }, {
            x: (v1.y * v2.z - v1.z * v2.y),
            y: -(v1.x * v2.z - v1.z * v2.x),
            z: (v1.x * v2.y - v1.y * v2.x),
        }
    ];
};

export function inverse3x3(M: Matrix3x3): Matrix3x3 {
    const det = determinant3x3(M);
    if (det === 0) return undefined;

    return scale3x3(1 / det, adjugate3x3(M));
};

/**
 * Returns index i where the line i to i+1 is the hypotenuse
 * @param triangle
 */
export function findHypotenuse(triangle: Triangle3D) {
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
    return longestLineIndex
}

export function perpendicularDisector(triangle: Triangle3D) {
    // Find perpendicular disector to 3rd vertex
    // Because it is from the hypotenuse, the disector must be inside the triangle
    const v = triangle;
    const i = findHypotenuse(triangle);

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

    return X;
}

export function getBoxModel(triangle: Triangle3D) {
    const hypotenuse = findHypotenuse(triangle);
    const p = perpendicularDisector(triangle);

    return {
        width: distance3D(triangle[hypotenuse], triangle[(hypotenuse + 1) % 3]),
        height: distance3D(p, triangle[(hypotenuse + 2) % 3]),
        borderLeft: distance3D(triangle[hypotenuse], p),
        borderRight: distance3D(triangle[(hypotenuse + 1) % 3], p),
    }

}