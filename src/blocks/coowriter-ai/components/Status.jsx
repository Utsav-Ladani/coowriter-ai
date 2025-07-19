import { useState, useEffect } from '@wordpress/element';
import {
	CheckCheck,
	LoaderCircle,
	Sparkles,
	AlertTriangle,
	X,
} from 'lucide-react';

export function Status( {
	isLoading,
	isSuccess,
	error,
	warning,
	isUseSelectionMode,
	resetStatus,
} ) {
	if ( isLoading ) {
		return <LoadingMessage />;
	}

	if ( isSuccess ) {
		return <SuccessMessage onClose={ resetStatus } />;
	}

	if ( error ) {
		return <ErrorMessage error={ error } />;
	}

	if ( warning ) {
		return <WarningMessage warning={ warning } />;
	}

	return (
		<div className="flex items-center gap-1">
			<span className="block">
				<Sparkles size={ 16 } className="text-[#6366f1]" />
			</span>
			<span>
				{ isUseSelectionMode
					? 'AI will only modify the selected blocks.'
					: 'Press Cmd + Enter to generate and Esc to close.' }
			</span>
		</div>
	);
}

function ErrorMessage( { error } ) {
	return (
		<div className="flex items-center gap-1">
			<span className="block">
				<X size={ 16 } className="text-red-600" />
			</span>
			<span>{ error }</span>
		</div>
	);
}

function WarningMessage( { warning } ) {
	return (
		<div className="flex items-center gap-1">
			<span className="block">
				<AlertTriangle size={ 16 } className="text-orange-600" />
			</span>
			<span>{ warning }</span>
		</div>
	);
}

// Progressive loading messages
const LOADING_MESSAGES = [
	'Analyzing your request 🧠',
	'Crafting creative content ❇️',
	'Structuring your ideas 📚',
	'Adding finishing touches 🎨',
	'Almost ready to amaze you 🚀',
];

function LoadingMessage() {
	const [ messageIndex, setMessageIndex ] = useState( 0 );

	useEffect( () => {
		const interval = setInterval( () => {
			setMessageIndex(
				( prev ) => ( prev + 1 ) % LOADING_MESSAGES.length
			);
		}, 3000 );

		return () => clearInterval( interval );
	}, [] );

	return (
		<div className="flex items-center gap-1">
			<span className="block">
				<LoaderCircle
					size={ 16 }
					className="text-yellow-500 animate-[spin_800ms_linear_infinite]"
				/>
			</span>
			<span>{ LOADING_MESSAGES[ messageIndex ] }</span>
		</div>
	);
}

function SuccessMessage( { onClose } ) {
	useEffect( () => {
		const timeout = setTimeout( () => {
			onClose?.();
		}, 2000 );

		return () => clearTimeout( timeout );
	}, [ onClose ] );

	return (
		<div className="flex items-center gap-1">
			<span className="block">
				<CheckCheck size={ 16 } className="text-green-700" />
			</span>
			<span>Content generated successfully!</span>
		</div>
	);
}
