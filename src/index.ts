import * as assert from 'assert';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Parser } from 'xml2js';

// File format docs: https://docs.fileformat.com/3d/dae/
export const COLLADA = 'COLLADA';
export const GEOMETRY_ATTRIBUTES = 'library_geometries';
export const GEOMETRY = 'geometry';
export const MESH = 'mesh';
export const SOURCE = 'source';

export type Mesh = {
    source: { $: { id: string } }[],
    vertices: [{
        $: { id: string },
        input: { $: { source: string } }[]
    }],
    triangles: {
        $: { id: string, count: string },
        input: { $: { source: string, semantic: string, offset: string } }[],
        p: string[]
    }[]
};

export type ColladaJSON = {
    COLLADA: {
        $: {
            xmlns: string,
            version: string,
            'xmlns:xsi': string
        },
        asset: unknown,
        library_images: unknown,
        library_geometries: {
            geometry: {
                mesh: Mesh[];
            }[]
        }[],
        library_visual_scenes: unknown,
        scene: unknown
    }
};

export type Vector3d = { x: number, y: number, z: number };
export type Triangle3D = [Vector3d, Vector3d, Vector3d];
export type TrianglesIndices = number[];
export type Triangles3D = Triangle3D[];

export async function DAEFile2JSON(relativePath: string) {
    // Read file
    let contents = '';
    const resolvedPath = resolve(relativePath);
    try {
        contents = readFileSync(resolvedPath).toString();
    } catch (e) {
        throw new Error(`Cannot read file ${resolvedPath}`);
    }

    // Parse XML
    let xmlJSON;
    try {
        xmlJSON = await new Parser(/* options */).parseStringPromise(contents);
    } catch (e) {
        throw new Error('Cannot parse XML');
    }

    return xmlJSON;
};

export function JSON2Mesh(daeJson: ColladaJSON) {
    const geometries = daeJson.COLLADA.library_geometries;
    if (geometries.length > 1) {
        throw new Error('File contains multiple geometries');
    }
    const meshes = geometries[0].geometry;
    if (meshes.length > 1) {
        throw new Error('File contains multiple meshes');
    }

    const mesh = meshes[0].mesh[0];
    return mesh;
};

export function getTriangleIndecies(mesh: Mesh) {
    // Get correct mapping
    const verticesId = '#' + mesh.vertices[0].$.id;

    // Find Vertex Source
    const triangles = mesh.triangles[0];
    const triangleCount = parseInt(triangles.$.count);
    const vertexInput = triangles.input.find((input) => input.$.semantic === 'VERTEX');
    const vertexSourceId = vertexInput.$.source;

    if (vertexSourceId !== verticesId) {
        throw new Error('Cannot find vertex data');
    }

    // Filter vertex data
    const allTriangleData = triangles.p[0]
        .split(/\s/)
        .map((s) => parseInt(s));
    const totalOffsets = allTriangleData.length / triangleCount / 3;
    assert.strictEqual(Math.floor(totalOffsets), totalOffsets, 'Malformed vertex data'); // Must be integer
    const offset = parseInt(vertexInput.$.offset);
    const vertexTriangleData = allTriangleData.filter((_, i) => i % totalOffsets === offset);

    return vertexTriangleData as TrianglesIndices;
};