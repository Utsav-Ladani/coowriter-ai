import {
	createBlocks,
	extractBlockData,
	getSelectedBlocks,
} from './blocks-utils';
import { generateBlocks } from './gen';

export async function processTask( {
	message,
	allBlocks = getSelectedBlocks(),
	selectedBlocks,
	blocksReplacer,
	updateSubscription = () => {},
} ) {
	try {
		const allBlocksData = allBlocks.map( extractBlockData );
		const selectedBlocksData = selectedBlocks?.map( extractBlockData );

		const { blocks: generatedBlocksData = [], subscription } =
			await generateBlocks( message, allBlocksData, selectedBlocksData );

		const generatedBlocks = createBlocks( generatedBlocksData );
		await blocksReplacer( selectedBlocks || allBlocks, generatedBlocks );

		updateSubscription( subscription );

		return { success: true };
	} catch ( error ) {
		throw new Error( error.message || 'Generation failed' );
	}
}
