<?php

namespace CooWriterAI\Settings;

use const CooWriterAI\API_URL;
use const CooWriterAI\PLUGIN_FILE;

const SETTINGS_KEY = 'coowriter-ai';

const API_SECTION = 'coowriter-ai-api-section';
const API_KEY_FIELD = 'coowriter-ai-api-key';

function bootstrap() {
    add_action( 'admin_menu', __NAMESPACE__ . '\register_coowriter_ai_settings_menu' );
    add_action( 'admin_init', __NAMESPACE__ . '\register_coowriter_ai_settings' );

    add_filter('plugin_action_links_' . plugin_basename( PLUGIN_FILE ), __NAMESPACE__ . '\coowriter_ai_add_settings_link');
}

function register_coowriter_ai_settings_menu() {
    add_menu_page(
        esc_html__( 'CooWriter AI Settings', 'coowriter-ai' ),
        esc_html__( 'CooWriter AI', 'coowriter-ai' ),
        'manage_options',
        SETTINGS_KEY,
        __NAMESPACE__ . '\coowriter_ai_settings_page'
    );
}

function coowriter_ai_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    // Nonce verification is not required as it's handled by the WordPress core.
    if ( isset( $_GET['settings-updated'] ) && 'true' === $_GET['settings-updated'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        add_settings_error(
            SETTINGS_KEY,
            'coowriter_ai_message',
            esc_html__( 'Settings Saved', 'coowriter-ai' ),
            'updated'
        );
    }

    settings_errors( SETTINGS_KEY );

    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        <p><?php esc_html_e( 'Transform your WordPress writing experience with CooWriter AI - your intelligent writing assistant that generates, enhances, and refines content directly within the block editor.', 'coowriter-ai' ); ?></p>
        <p>
        <?php printf(
            /* translators: %s: CooWriter AI website link */
            esc_html__('Visit %s for more information.', 'coowriter-ai'),
            '<a href="https://coowriterai.com" target="_blank">' . esc_html__( 'CooWriter AI', 'coowriter-ai' ) . '</a>'
        ); ?>
        </p>
        
        <form action="options.php" method="post">
            <?php
            settings_fields( SETTINGS_KEY );
            do_settings_sections( SETTINGS_KEY );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

function register_coowriter_ai_settings() {
    register_setting(
        SETTINGS_KEY,
        API_KEY_FIELD,
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ]
    );

    add_settings_section(
        API_SECTION,
        '',
        '__return_empty_string',
        SETTINGS_KEY
    );

    add_settings_field(
        API_KEY_FIELD,
        'CooWriter AI API Key',
        __NAMESPACE__ . '\coowriter_ai_api_key_field_callback',
        SETTINGS_KEY,
        API_SECTION
    );
}

function coowriter_ai_api_key_field_callback() {
    $api_key = get_option( API_KEY_FIELD, '' );

    ?>
    <input
        type="password"
        name="<?php echo esc_attr( API_KEY_FIELD ); ?>"
        value="<?php echo esc_attr( $api_key ); ?>"
        placeholder="<?php esc_html_e( 'Enter your CooWriter AI API Key', 'coowriter-ai' ); ?>"
        class="regular-text"
    />
    <p class="description">
        <a href="<?php echo esc_url( API_URL . '/profile' ); ?>" target="_blank"><?php esc_html_e( 'Get your API Key', 'coowriter-ai' ); ?></a>
    </p>
    <?php
}

function coowriter_ai_add_settings_link($links) {
    $settings_link = '<a href="' . esc_url(admin_url('admin.php?page=coowriter-ai')) . '">' . esc_html__('Settings', 'coowriter-ai') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}