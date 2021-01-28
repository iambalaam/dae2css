import {
    DAEFile2JSON, JSON2Mesh, getTriangleIndecies, getIndexVertices, mapTriangleIndecesToVertices,
    COLLADA,
    TrianglesIndices,
    Vector3d,
    parseDAETriangles
} from './DAEParser';


it('can parse xml attributes', async () => {
    const daeJSON = await DAEFile2JSON('mocks/cube.dae');
    expect(Object.keys(daeJSON)).toEqual([COLLADA]);
});

it('gets triangle data as vertex indices', async () => {
    // A cube has 6 sqaure sides -> 12 triangles
    const daeJSON = await DAEFile2JSON('mocks/cube.dae');
    expect(getTriangleIndecies(JSON2Mesh(daeJSON)).length).toBe(12);
});

it('gets all vertices', async () => {
    const daeJSON = await DAEFile2JSON('mocks/cube.dae');
    const vertices = (getIndexVertices(JSON2Mesh(daeJSON)));

    // Map all vertices to binary 0-7, and check all are there
    const mappedVertices = vertices.map((v) => ({
        x: v.x / 2 + 0.5,
        y: v.y / 2 + 0.5,
        z: v.z / 2 + 0.5
    }));
    const binaryCheck = [];
    mappedVertices.forEach((v) => {
        const binary = (v.x * 1) + (v.y * 2) + (v.z * 4);
        binaryCheck[binary] = true;
    });
    expect(binaryCheck).toEqual(Array(8).fill(true));
});

it('maps triangle indeces to vertices', () => {
    const mockTriangles: TrianglesIndices = [[0, 1, 2]];
    const mockVertices: Vector3d[] = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
    ];
    expect(mapTriangleIndecesToVertices(mockTriangles, mockVertices)).toEqual(
        [[
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 }
        ]]
    )
});

it('can parse triangles in an icosahedron', async () => {
    const triangles = await parseDAETriangles('mocks/icosahedron.dae');
    expect(triangles).toHaveLength(20);
});

it('can parse triangles in an icosphere', async () => {
    const triangles = await parseDAETriangles('mocks/icosphere.dae');
    expect(triangles).toHaveLength(80);
});