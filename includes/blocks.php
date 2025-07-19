<?php

namespace CooWriterAI\Blocks;

use const CooWriterAI\PLUGIN_DIR;

function bootstrap() {
	add_action('admin_enqueue_scripts', __NAMESPACE__ . '\coowriter_ai_enqueue_assets');
	add_action('enqueue_block_assets', __NAMESPACE__ . '\coowriter_ai_enqueue_block_assets');
}

function coowriter_ai_enqueue_assets()
{
	$is_runtime_file_exists = file_exists(PLUGIN_DIR . '/build/runtime.asset.php');

	if ($is_runtime_file_exists) {
		$runtime_asset_file = include PLUGIN_DIR . '/build/runtime.asset.php';

		if(empty($runtime_asset_file)) {
			return;
		}

		wp_enqueue_script(
			'coowriter-ai-runtime',
			plugins_url('build/runtime.js', __DIR__),
			$runtime_asset_file['dependencies'],
			$runtime_asset_file['version'],
			true
		);
	}

	$asset_file = include PLUGIN_DIR . '/build/index.asset.php';

	wp_enqueue_script(
		'coowriter-ai-scripts',
		plugins_url('build/index.js', __DIR__),
		$asset_file['dependencies'],
		$asset_file['version'],
		[
			'in_footer' => true,
		]
	);

	wp_localize_script(
		'coowriter-ai-scripts',
		'cooWriterAIBlocksObj',
		[
			'settingsURL' => admin_url('options-general.php?page=coowriter-ai'),
		]
	);

	wp_enqueue_style(
		'coowriter-ai-styles',
		plugins_url('build/index.css', __DIR__),
		[],
		$asset_file['version']
	);
}

function coowriter_ai_enqueue_block_assets()
{
	if (!is_admin()) {
		return;
	}

	$asset_file = include PLUGIN_DIR . '/build/blocks.asset.php';

	wp_enqueue_script(
		'coowriter-ai-blocks-scripts',
		plugins_url('build/blocks.js', __DIR__),
		$asset_file['dependencies'],
		$asset_file['version'],
		[
			'in_footer' => true,
		]
	);

	wp_enqueue_style(
		'coowriter-ai-blocks-styles',
		plugins_url('build/blocks.css', __DIR__),
		[],
		$asset_file['version']
	);
}
