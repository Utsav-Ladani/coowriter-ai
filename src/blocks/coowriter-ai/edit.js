import {
	useState,
	useLayoutEffect,
	useEffect,
	useRef,
} from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { dispatch } from '@wordpress/data';
import { X, ArrowUp, Pin } from 'lucide-react';
import { processTask } from '../../libs/task-worker';
import { useSelectedBlocks } from './hooks/useSelectedBlocks';
import { Tooltip } from '@wordpress/components';
import {
	addOrReplaceBlocks,
	getAllBlocks,
	removeOtherCooWriterBlocks,
} from '../../libs/blocks-utils';
import classNames from 'classnames';
import { Subscription } from './components/Subscription';
import { Status } from './components/Status';

import { useSubscription } from './hooks/useSubscription';
import { useDynamicPlaceholder } from './hooks/useDynamicPlaceholder';

const STORAGE_KEYS = {
	PINNED: 'coowriter-ai-pinned',
	USE_SELECTION_MODE: 'coowriter-ai-use-selection-mode',
};

const removeBlockHighlighting = () => {
	const alreadyHighlightedBlocks = document
		.querySelector( 'iframe[name="editor-canvas"]' )
		.contentDocument.querySelectorAll( '[data-coowriter-ai-highlighted]' );
	alreadyHighlightedBlocks.forEach( ( block ) => {
		block.removeAttribute( 'data-coowriter-ai-highlighted' );
	} );
};

const addBlockHighlighting = ( selectedBlocks ) => {
	selectedBlocks
		.map( ( block ) =>
			document
				.querySelector( 'iframe[name="editor-canvas"]' )
				.contentDocument.querySelector( `#block-${ block.clientId }` )
		)
		.filter( Boolean )
		.forEach( ( element ) => {
			element.setAttribute( 'data-coowriter-ai-highlighted', 'true' );
		} );
};

export default function Edit( { clientId, isSelected } ) {
	const { localStorage } = window;

	const textareaRef = useRef( null );

	const [ message, setMessage ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isUseSelectionMode, setIsUseSelectionMode ] = useState(
		localStorage.getItem( STORAGE_KEYS.USE_SELECTION_MODE ) === 'true'
	);
	const [ isSuccess, setIsSuccess ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ warning, setWarning ] = useState( null );
	const [ isPinned, setIsPinned ] = useState(
		localStorage.getItem( STORAGE_KEYS.PINNED ) === 'true'
	);
	const {
		subscription,
		isLoading: isSubscriptionLoading,
		setSubscription,
	} = useSubscription();

	const dynamicPlaceholder = useDynamicPlaceholder();
	const { selectedBlocks } = useSelectedBlocks();

	useLayoutEffect( () => {
		if ( isLoading ) {
			return;
		}

		if ( selectedBlocks?.length ) {
			addBlockHighlighting( selectedBlocks );
		}

		return () => removeBlockHighlighting();
	}, [ selectedBlocks, isLoading ] );

	useEffect( () => {
		removeOtherCooWriterBlocks( clientId );
	}, [ clientId ] );

	// Hack to focus the textarea when the block is selected after selecting multiple other blocks
	useEffect( () => {
		if ( ! isSelected ) {
			return;
		}

		const textarea = textareaRef.current;

		setTimeout( () => {
			if ( textarea ) {
				textarea.focus();
			}
		}, 100 );
	}, [ isSelected ] );

	const handleSubmit = async ( e ) => {
		e.preventDefault();

		if ( ! message.trim() ) {
			return;
		}

		if ( ! subscription ) {
			setError( 'Subscription not found. Please add correct API key.' );
			return;
		}

		const { usedCredits = 0, totalCredits = 0 } = subscription ?? {};

		if ( usedCredits >= totalCredits ) {
			setError(
				"You've used all your credits. Please upgrade to continue."
			);
			return;
		}

		// Clear any previous errors/warnings and feedback state
		setError( null );
		setWarning( null );
		setIsSuccess( false );
		setIsLoading( true );

		try {
			await processTask( {
				message: message.trim(),
				allBlocks: getAllBlocks(),
				selectedBlocks: isUseSelectionMode ? selectedBlocks : undefined,
				blocksReplacer: async ( oldBlocks, newBlocks ) => {
					await addOrReplaceBlocks( oldBlocks, newBlocks, clientId );
				},
				updateSubscription: ( updatedSubscription ) => {
					setSubscription( ( prev ) => ( {
						...prev,
						...updatedSubscription,
					} ) );
				},
			} );

			setMessage( '' );
			setIsSuccess( true );
		} catch ( submissionError ) {
			setError(
				submissionError?.message ||
					'Generation failed due to an error. Please try again.'
			);
		} finally {
			setIsLoading( false );
		}
	};

	const handleResetStatus = () => {
		setIsLoading( false );
		setIsSuccess( false );
		setError( null );
		setWarning( null );
	};

	const handleDone = () => {
		dispatch( 'core/block-editor' ).removeBlocks( [ clientId ] );
	};

	const handlePin = () => {
		localStorage.setItem( STORAGE_KEYS.PINNED, ! isPinned );
		setIsPinned( ! isPinned );
	};

	const handleModeToggle = () => {
		localStorage.setItem(
			STORAGE_KEYS.USE_SELECTION_MODE,
			! isUseSelectionMode
		);
		setIsUseSelectionMode( ! isUseSelectionMode );
	};

	return (
		<div
			{ ...useBlockProps( {
				className: classNames( 'coowriter-ai coowriter-ai-tw', {
					'is-use-selected-blocks': isUseSelectionMode,
					'is-loading': isLoading,
					'is-pinned': isPinned,
				} ),
			} ) }
		>
			<form
				className="relative pb-2 bg-white rounded text-base font-normal overflow-hidden"
				onSubmit={ handleSubmit }
			>
				<div className="ps-3 pe-2 py-1.5 mb-1 flex gap-1 items-center bg-gray-100 border-b border-gray-200">
					<div className="text-xs font-bold text-gray-600 w-full">
						CooWriter AI
					</div>
					<button
						type="button"
						title={ isPinned ? 'Unpin' : 'Pin' }
						className={ classNames( 'cursor-pointer', {
							'text-gray-500 hover:text-gray-700': ! isPinned,
							'text-gray-800 hover:text-black': isPinned,
						} ) }
						disabled={ isLoading }
						onClick={ handlePin }
					>
						<Pin size={ 16 } stroke="currentColor" />
					</button>
					<button
						type="button"
						title="Close"
						className="cursor-pointer text-gray-500 hover:text-gray-700"
						disabled={ isLoading }
						onClick={ handleDone }
					>
						<X size={ 16 } stroke="currentColor" />
					</button>
				</div>
				<textarea
					ref={ textareaRef }
					name="message"
					className="!m-0 !p-0 !pt-0.5 !ps-3 !pe-2 !outline-none w-full !border-none placeholder-gray-500 !text-black resize-none min-h-[70px] max-h-[180px] field-sizing-content disabled:opacity-50"
					placeholder={ dynamicPlaceholder }
					value={ message }
					disabled={ isLoading }
					onChange={ ( event ) => setMessage( event.target.value ) }
					onKeyDown={ ( event ) => {
						if ( event.key === 'Enter' && event.metaKey ) {
							event.preventDefault();
							handleSubmit( event );
						}

						if ( event.key === 'Escape' ) {
							event.preventDefault();
							handleDone();
						}
					} }
				/>
				<div className="mx-2 flex gap-2 text-sm justify-end items-center">
					<div className="w-full text-gray-600 me-2">
						<Status
							isLoading={ isLoading }
							isSuccess={ isSuccess }
							error={ error }
							warning={ warning }
							isUseSelectionMode={ isUseSelectionMode }
							resetStatus={ handleResetStatus }
						/>
					</div>

					<Tooltip
						text={
							isUseSelectionMode
								? 'Selected Mode is active. AI will only modify the selected blocks.'
								: 'Normal Mode is active. AI will modify all blocks.'
						}
					>
						<button
							className="whitespace-nowrap text-xs bg-white border border-gray-500 text-gray-600 px-1.5 py-0.5 rounded z-10 cursor-pointer"
							type="button"
							disabled={ isLoading }
							onClick={ handleModeToggle }
						>
							{ isUseSelectionMode
								? 'Selection Mode'
								: 'Normal Mode' }
						</button>
					</Tooltip>

					<Tooltip text="Generate" shortcut={ '⌘ + ↵' }>
						<button
							type="submit"
							className="p-1 rounded cursor-pointer border border-black bg-black text-white hover:bg-gray-50 hover:text-black transition-all duration-200"
						>
							<ArrowUp size={ 16 } stroke="currentColor" />
						</button>
					</Tooltip>
				</div>
			</form>
			<InspectorControls>
				<div className="coowriter-ai-controls-body">
					<Subscription
						isLoading={ isSubscriptionLoading }
						subscription={ subscription }
					/>
				</div>
			</InspectorControls>
		</div>
	);
}
