export function request( path, data ) {
	const { ajaxURL, nonce, action } = window.cooWriterAIApiObj || {};

	if ( ! ajaxURL || ! nonce || ! action ) {
		throw new Error( 'CooWriter AI API is not initialized' );
	}

	return fetch( ajaxURL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams( {
			...data,
			action,
			nonce,
			path,
		} ),
	} );
}
