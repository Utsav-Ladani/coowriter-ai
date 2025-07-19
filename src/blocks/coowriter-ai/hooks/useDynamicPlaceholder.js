import { useState, useEffect } from '@wordpress/element';

const PLACEHOLDER_EXAMPLES = [
	'Create a call-to-action section',
	'Add a conclusion section',
	'Make a 3 column layout',
	'Create a comparison table',
	'Improve this text',
	'Write a compelling introduction',
	'Generate testimonials section',
	'Add FAQ section',
];

export function useDynamicPlaceholder() {
	const [ placeholderIndex, setPlaceholderIndex ] = useState( 0 );

	useEffect( () => {
		const interval = setInterval( () => {
			setPlaceholderIndex(
				( prev ) => ( prev + 1 ) % PLACEHOLDER_EXAMPLES.length
			);
		}, 3000 ); // Change every 3 seconds

		return () => clearInterval( interval );
	}, [] );

	return PLACEHOLDER_EXAMPLES[ placeholderIndex ];
}
