import { DAEFile2JSON, COLLADA } from './index';

let json;

it('can parse xml attributes', async () => {
    const dae = await DAEFile2JSON('mocks/icosphere.dae');
    json = dae;
    expect(Object.keys(dae)).toEqual([COLLADA]);
});
