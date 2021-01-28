import {
    DAEFile2JSON, JSON2Mesh, getTriangleIndecies, getIndexVertices,
    COLLADA
} from './index';


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
