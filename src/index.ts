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
    source: {
        $: { id: string }, float_array: {
            $: { id: string, count: string },
            _: string
        }[]
    }[],
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
export type TrianglesIndices = [number, number, number][];
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

export function getSourceId(mesh: Mesh) {
    const inputSources = mesh.vertices[0].input;
    if (!inputSources || !inputSources.length) {
        throw new Error('Cannot find input source data');
    }
    if (inputSources.length> 1) {
        throw new Error('Multiple input source data found');
    }
    return inputSources[0].$.source;
};

export function getVerticesId(mesh: Mesh) {
    const vertices =  mesh.vertices;
    if (!vertices || !vertices.length) {
        throw new Error('Cannot find vertex data');
    }
    if (vertices.length > 1) {
        throw new Error('Multiple vertex data found');
    }
    return '#' + vertices[0].$.id;
};

export function assertLinkedVertexIds(mesh: Mesh) {
    const verticesId = getVerticesId(mesh);
    const triangles = mesh.triangles[0];
    const vertexInput = triangles.input.find((input) => input.$.semantic === 'VERTEX');
    if (vertexInput.$.source !== verticesId) {
        throw new Error('Cannot find vertex data');
    }
};

export function getTriangleIndecies(mesh: Mesh): TrianglesIndices {
    // Find Vertex Source
    const triangles = mesh.triangles[0];
    const triangleCount = parseInt(triangles.$.count);
    const vertexInput = triangles.input.find((input) => input.$.semantic === 'VERTEX');

    // Filter vertex data
    const allTriangleData = triangles.p[0]
        .split(/\s/)
        .map((s) => parseInt(s));
    const totalOffsets = allTriangleData.length / triangleCount / 3;

    // Must be integer
    if (Math.floor(totalOffsets) !== totalOffsets) {
        throw new Error('Malformed triangle data');
    }

    const offset = parseInt(vertexInput.$.offset);
    const vertexTriangleData = allTriangleData.filter((_, i) => i % totalOffsets === offset);

    return new Array(triangleCount)
        .fill(undefined)
        .map((_, i) => [vertexTriangleData[3 * i], vertexTriangleData[3 * i + 1], vertexTriangleData[3 * i + 2]]) as TrianglesIndices;
};

export function getIndexVertices(mesh: Mesh) {
    // TODO search instead of hardcode
    const sourceId = getSourceId(mesh)
    const vertexSource = mesh.source.find((source) => ('#' + source.$.id) === sourceId);
    const vertexCount = parseInt(vertexSource.float_array[0].$.count) / 3;

    // Must be integer
    if (Math.floor(vertexCount) !== vertexCount) {
        throw new Error('Malformed vertex data');
    }

    const vertices: Vector3d[] = [];
    vertexSource.float_array[0]._
        .split(/\s+/)
        .forEach((coordinate, index) => {
            const axis = index % 3;
            const vertex = (index - axis) / 3;

            switch (axis) {
                case 0:
                    vertices[vertex] = { x: parseFloat(coordinate), y: undefined, z: undefined };
                    break;
                case 1:
                    vertices[vertex].y = parseFloat(coordinate);
                    break;
                case 2:
                    vertices[vertex].z = parseFloat(coordinate);
                    break;
            } 
        });

        return vertices;

};

export function mapTriangleIndecesToVertices(trianglesIndices: TrianglesIndices, vertices: Vector3d[]): Triangles3D {
    return trianglesIndices
        .map(([v1, v2, v3]) => {
            if (Math.max(v1,v2,v3) > vertices.length) {
                throw new Error('Not enough vertex data');
            }
            return [vertices[v1], vertices[v2], vertices[v3]];
        });
};

export async function parseDAETriangles(relativePath: string) {
    const daeJSON = await DAEFile2JSON(relativePath);
    const mesh = JSON2Mesh(daeJSON);

    // Perform validation
    assertLinkedVertexIds(mesh);

    const t = getTriangleIndecies(mesh);
    const v = getIndexVertices(mesh);
    const triangles = mapTriangleIndecesToVertices(t, v);

    return triangles;
};