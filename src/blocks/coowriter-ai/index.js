import { registerBlockType } from '@wordpress/blocks';

import Edit from './edit';
import metadata from './metadata.json';
import { BlockIcon } from './components/BlockIcon';

registerBlockType(
	{
		...metadata,
		icon: <BlockIcon />,
	},
	{
		edit: Edit,
	}
);
