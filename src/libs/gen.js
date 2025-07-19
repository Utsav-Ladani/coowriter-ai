import { request } from './request';

export async function generateBlocks( prompt, allBlocks, selectedBlocks ) {
	const response = await request( '/api/v1/generation', {
		method: 'POST',
		body: JSON.stringify( {
			prompt,
			allBlocks,
			selectedBlocks,
		} ),
	} );

	const data = await response.json();

	if ( data?.error ) {
		throw new Error( data.error );
	}

	return data;
}
