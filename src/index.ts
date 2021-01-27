import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Parser } from 'xml2js';

// File format docs: https://docs.fileformat.com/3d/dae/
export const COLLADA = 'COLLADA';
export const GEOMETRY_ATTRIBUTES = 'library_geometries';
export const GEOMETRY = 'geometry';
export const MESH = 'mesh';
export const SOURCE = 'source';

export type ColladaJSON = {
    COLLADA: {
        $: {
            xmlns: string,
            version: string,
            'xmlns:xsi': string
        },
        asset: unknown,
        library_images: unknown,
        library_geometries: [{
            geometry: [{
                mesh: unknown;
            }]
        }],
        library_visual_scenes: unknown,
        scene: unknown
    }
}

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
    let xml;
    try {
        xml = await new Parser(/* options */).parseStringPromise(contents);
    } catch (e) {
        throw new Error('Cannot parse XML');
    }

    return xml;
}
