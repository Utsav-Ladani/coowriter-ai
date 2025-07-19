<?php
/**
 * Plugin Name: CooWriter AI
 * Description: AI-powered writing assistant for WordPress Block Editor.
 * Author:      CooWriter AI
 * Author URI:  https://profiles.wordpress.org/coowriterai
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Version:     0.1.0
 * Text Domain: coowriter-ai
 *
 * @package     CooWriterAI
 */

namespace CooWriterAI;

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

if (! defined('COOWRITER_AI_API_URL')) {
	define('COOWRITER_AI_API_URL', 'https://coowriterai.com');
}

const API_URL = COOWRITER_AI_API_URL;
const PLUGIN_DIR = __DIR__;
const PLUGIN_FILE = __FILE__;

include_once __DIR__ . '/includes/settings.php';
include_once __DIR__ . '/includes/blocks.php';
include_once __DIR__ . '/includes/api.php';

Settings\bootstrap();
Blocks\bootstrap();
API\bootstrap();
