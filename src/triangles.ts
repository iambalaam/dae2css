import { Triangle3D, Vector3d } from './types';

// Vector helpers
export function scale3D(s: number, v: Vector3d) {
    return { x: s * v.x, y: s * v.y, z: s * v.z };
};
export function add3D(v1: Vector3d, v2: Vector3d): Vector3d {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
};
export function subtract3D(v1: Vector3d, v2: Vector3d): Vector3d {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
};
export function dot3D(v1: Vector3d, v2: Vector3d): number {
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z)
};
export function magnitude3D(v: Vector3d): number {
    return Math.hypot(v.x, v.y, v.z);
};
export function distance3D(v1: Vector3d, v2: Vector3d): number {
    return magnitude3D(subtract3D(v2, v1));
};
export function cross3D(v1: Vector3d, v2: Vector3d): Vector3d {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    }
};
export function normal3D(v1: Vector3d, v2: Vector3d): Vector3d {
    const crossed = cross3D(v1, v2);
    const mag = magnitude3D(crossed);
    return scale3D(1 / mag, crossed);
};

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

export function rotateTriangleWithHypFirst(triangle: Triangle3D): Triangle3D {
    const i = findHypotenuse(triangle);
    return [triangle[i], triangle[(i + 1) % 3], triangle[(i + 2) % 3]]
}

/**
 * Expects the first two vertices to describe the hypotenuse, and continues anti-clockwise
 * @param triangle 
 */
export function perpendicularDisector(triangle: Triangle3D) {
    // Find perpendicular disector to 3rd vertex
    // Because it is from the hypotenuse, the disector must be inside the triangle
    const v = triangle;
    const i = findHypotenuse(triangle);

    // Let be the normal vector n = v[1] - v[0]
    const n = subtract3D(v[1], v[0]);
    // Line L: X = v[0] + λn

    // Plane ∏ with normal vector n passes through v[2]
    // So a point X on plane ∏ can be described:
    // n . v[2] = n . X = μ
    const μ = dot3D(n, v[2]);

    // Use equations for ∏ and L:
    const λ = (μ - dot3D(n, v[0])) / dot3D(n, n);

    // We have solved for point X
    const X = add3D(v[0], scale3D(λ, n));

    return X;
}

/**
 * Expects the first two vertices to describe the hypotenuse, and continues anti-clockwise
 * @param triangle 
 */
export function getBoxModel(triangle: Triangle3D) {
    const p = perpendicularDisector(triangle);

    return {
        width: distance3D(triangle[0], triangle[1]),
        height: distance3D(p, triangle[2]),
        borderLeft: distance3D(triangle[0], p),
        borderRight: distance3D(triangle[1], p),
    }
}

/**
 * Expects the first two vertices to describe the hypotenuse, and continues anti-clockwise
 * Expects the first vertex to be on the origin
 * @param triangle 
 */
export function getTransformationMatrix3D(iT: Triangle3D, tT: Triangle3D) {
    const initialNormal: Vector3d = { x: 0, y: 0, z: 1 };

    // Translate the first vertex to the origin
    const targetTriangle = [
        { x: 0, y: 0, z: 0 },
        subtract3D(tT[1], tT[0]),
        subtract3D(tT[2], tT[0])
    ]
    const targetNormal = normal3D(targetTriangle[1], targetTriangle[2])

    // Some transform matrix M maps initial vectorspace (iV) to target vectorspace (tV)
    // M(iT) = (tT)
    const iV: Matrix3x3 = [initialNormal, iT[1], iT[2]];
    const tV: Matrix3x3 = [targetNormal, targetTriangle[1], targetTriangle[2]]

    // If we can find an inverse (iVinv) so (iVinv)(iV) = I
    // Then
    // M = (tV)(iVinv)
    const iVinv = inverse3x3(iV);

    const M = multiply3x3(tV, iVinv);

    // We can now add the translation to make the affine 4x4 matrix
    return M
        .map(({ x, y, z }) => `${x}, ${y}, ${z}, 0`)
        .concat(`${tT[0].x}, ${tT[0].y}, ${tT[0].z}, 1`)
        .join(', ');
}