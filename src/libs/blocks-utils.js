import { select, dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import metadata from '../blocks/coowriter-ai/metadata.json';

export function getSelectedBlocks() {
	const blockEditorSelect = select( 'core/block-editor' );
	const hasMultiSelection = blockEditorSelect.hasMultiSelection();

	if ( hasMultiSelection ) {
		return blockEditorSelect.getMultiSelectedBlocks() ?? [];
	}

	const selectedBlock = blockEditorSelect.getSelectedBlock();
	return selectedBlock ? [ selectedBlock ] : [];
}

export function extractBlockData( block ) {
	return {
		name: block.name,
		attributes: {
			...block.attributes,
			content: block?.attributes?.content?.toString(),
		},
		innerBlocks: block.innerBlocks.map( extractBlockData ),
	};
}

export function createBlocks( blocks ) {
	if ( ! blocks?.length ) {
		return [];
	}

	return blocks.map( ( block ) =>
		createBlock(
			block.name,
			block.attributes,
			createBlocks( block.innerBlocks )
		)
	);
}

export function getAllBlocks() {
	return select( 'core/block-editor' )
		.getBlocks()
		.filter( ( block ) => block.name !== metadata.name );
}

export function addOrReplaceBlocks( oldBlocks, newBlocks, clientId ) {
	if ( oldBlocks?.length ) {
		return dispatch( 'core/block-editor' ).replaceBlocks(
			oldBlocks.map( ( block ) => block.clientId ),
			newBlocks
		);
	}

	const rootClientId =
		select( 'core/block-editor' ).getBlockRootClientId( clientId );
	const blockIndex = select( 'core/block-editor' ).getBlockIndex( clientId );

	return dispatch( 'core/block-editor' ).insertBlocks(
		newBlocks,
		blockIndex,
		rootClientId
	);
}

export function removeOtherCooWriterBlocks( clientId ) {
	const allBlocks = select( 'core/block-editor' ).getBlocks();
	const cooWriterBlocks = allBlocks.filter(
		( block ) => block.name === metadata.name && block.clientId !== clientId
	);

	dispatch( 'core/block-editor' ).removeBlocks(
		cooWriterBlocks.map( ( block ) => block.clientId )
	);
}
