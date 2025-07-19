<?php

namespace CooWriterAI\API;

use const CooWriterAI\API_URL;
use const CooWriterAI\Settings\API_KEY_FIELD;

const ACTION_NAME = 'coowriter_ai_api';

const ALLOWED_PATHS = [
    '/api/v1/app-subscription',
    '/api/v1/generation',
];

const ALLOWED_METHODS = [
    'GET',
    'POST',
];

function bootstrap() {
    add_action('admin_enqueue_scripts', __NAMESPACE__ . '\coowriter_ai_admin_enqueue_scripts');
	add_action('wp_ajax_coowriter_ai_api', __NAMESPACE__ . '\coowriter_ai_api_ajax_handler');
}

function coowriter_ai_admin_enqueue_scripts() {
    wp_localize_script(
		'coowriter-ai-scripts',
		'cooWriterAIApiObj',
		array(
			'ajaxURL' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( ACTION_NAME ),
            'action'   => ACTION_NAME,
		)
	);
}

function coowriter_ai_api_ajax_handler() {
    check_ajax_referer(ACTION_NAME, 'nonce');

    if (!current_user_can('edit_posts')) {
        wp_send_json([
            'error' => __( 'You are not authorized to access this API', 'coowriter-ai' ),
        ], 403);
        return;
    }

    $path = sanitize_url(wp_unslash($_POST['path'] ?? ''));

    if (!in_array($path, ALLOWED_PATHS)) {
        wp_send_json([
            'error' => __( 'Invalid path', 'coowriter-ai' ),
        ], 400);
        return;
    }

    $method = sanitize_text_field(wp_unslash($_POST['method'] ?? 'GET'));

    if (!in_array($method, ALLOWED_METHODS)) {
        wp_send_json([
            'error' => __( 'Invalid method', 'coowriter-ai' ),
        ], 400);
        return;
    }

    $body = sanitize_textarea_field(wp_unslash($_POST['body'] ?? ''));

    if ($body) {
        $body = json_decode($body, true);
        $body = wp_json_encode($body);
    }

    if (json_last_error() !== JSON_ERROR_NONE) {
        wp_send_json([
            'error' => __( 'Invalid JSON in response body', 'coowriter-ai' ),
        ], 500);
        return;
    }

    $api_key = get_option(API_KEY_FIELD);

    $args = [
        'headers' => [
            'Content-Type' => 'application/json',
            'x-api-key'    => $api_key,
        ],
        'method' => $method,
        'timeout' => 120,
    ];

    if ($body) {
        $args['body'] = $body;
    }

    $response = wp_remote_request(
        API_URL . $path,
        $args
    );

    if (is_wp_error($response)) {
        wp_send_json([
            'error' => $response->get_error_message(),
        ], 500);
        return;
    }

    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);

    // Decode the API response
    $decoded_response = json_decode($response_body, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        wp_send_json([
            'error' => __( 'Invalid JSON in response body', 'coowriter-ai' ),
        ], 500);
        return;
    }

    wp_send_json($decoded_response, $response_code);
}
