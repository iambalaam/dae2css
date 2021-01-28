import {
    DAEFile2JSON, JSON2Mesh, getTriangleIndecies,
    COLLADA
} from './index';

let json;

it('can parse xml attributes', async () => {
    const dae = await DAEFile2JSON('mocks/cube.dae');
    json = dae;
    expect(Object.keys(dae)).toEqual([COLLADA]);
});

it('gets triangle data as vertex indices', () => {
    expect(
        getTriangleIndecies(JSON2Mesh(json)).length
    ).toBeGreaterThan(2);
});