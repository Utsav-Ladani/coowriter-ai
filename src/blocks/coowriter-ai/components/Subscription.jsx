import {
	CircleFadingArrowUp,
	Calendar,
	LoaderCircle,
	TrendingUp,
} from 'lucide-react';

export function Subscription( { isLoading, subscription } ) {
	if ( isLoading ) {
		return (
			<div className="py-2.5 px-3 border-t border-gray-200 flex items-center justify-center h-[100px]">
				<LoaderCircle
					size={ 24 }
					className="animate-spin text-[#6366f1]"
				/>
			</div>
		);
	}

	const { totalCredits, usedCredits, planId, expiresAt } = subscription ?? {};

	if ( ! planId || ! expiresAt || ! totalCredits ) {
		return (
			<div className="py-2.5 px-3 border-t border-gray-200 text-center">
				<div className="text-gray-700 mb-4">
					Connect your account to start using AI writing features
				</div>
				<a
					href={ window.cooWriterAIBlocksObj.settingsURL }
					className="bg-[#5558e4] text-white px-3 py-1.5 rounded text-sm no-underline hover:text-[#5558e4] hover:bg-transparent hover:border hover:border-[#5558e4]"
					rel="noreferrer"
				>
					Add API Key
				</a>
			</div>
		);
	}

	return (
		<div className="py-2.5 px-3 border-t border-gray-200">
			<div className="flex items-center gap-1 justify-between">
				<div className="text-black text-lg">Subscription</div>
				<SubscriptionType planId={ planId } />
			</div>
			<div className="mt-1">
				<span className="text-gray-700 text-3xl">
					{ totalCredits - usedCredits }
				</span>
				&nbsp;
				<span className="text-gray-500 text-sm">
					/ { totalCredits } Credits left
				</span>
			</div>
			<div className="h-2 bg-gray-200 rounded-full w-full mt-2">
				<div
					className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
					style={ {
						width: `${
							( ( totalCredits - usedCredits ) / totalCredits ) *
							100
						}%`,
					} }
				/>
			</div>
			<div className="flex justify-between gap-1 mt-2 text-gray-500">
				<div className="flex items-center gap-1">
					<TrendingUp size={ 16 } stroke="currentColor" />
					<span className="text-sm">Used: { usedCredits }</span>
				</div>
				<div className="flex items-center gap-1">
					<Calendar size={ 16 } stroke="currentColor" />
					<span className="text-sm">
						Reset: { new Date( expiresAt ).toLocaleDateString() }
					</span>
				</div>
			</div>
			{ planId === 'free' && (
				<a
					href="https://coowriterai.com/#pricing"
					target="_blank"
					className="!text-[#5558e4] flex items-center gap-2 mt-4 hover:underline"
					rel="noreferrer"
				>
					<CircleFadingArrowUp size={ 20 } stroke="currentColor" />
					<span>Upgrade to Premium for more credits</span>
				</a>
			) }
		</div>
	);
}

function SubscriptionType( { planId } ) {
	return (
		<div className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-1.5 py-0.5 rounded capitalize">
			{ planId }
		</div>
	);
}
