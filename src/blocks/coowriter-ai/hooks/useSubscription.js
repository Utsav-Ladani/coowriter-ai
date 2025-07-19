import { useState, useEffect } from '@wordpress/element';
import { request } from '../../../libs/request';

export const useSubscription = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ subscription, setSubscription ] = useState( null );

	useEffect( () => {
		let isMounted = true;

		const handleFetchSubscription = async () => {
			const response = await request( '/api/v1/app-subscription', {
				method: 'GET',
			} );

			const data = await response.json();

			if ( ! isMounted ) {
				return;
			}

			if ( response.ok ) {
				setSubscription( data );
			} else {
				setSubscription( null );
			}

			setIsLoading( false );
		};

		try {
			handleFetchSubscription();
		} catch {
			// Do nothing.
		}

		return () => {
			isMounted = false;
		};
	}, [] );

	return {
		isLoading,
		subscription: isLoading || ! subscription ? null : subscription,
		setSubscription,
	};
};
