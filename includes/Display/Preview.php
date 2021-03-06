<?php

namespace DialogContactForm\Display;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Preview {

	public static $instance = null;

	/**
	 * @return Preview
	 */
	public static function init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();

			add_filter( 'template_include', array( self::$instance, 'template_include' ) );
		}

		return self::$instance;
	}

	/**
	 * Include form preview template
	 *
	 * @param string $template
	 *
	 * @return string
	 */
	public static function template_include( $template ) {
		if ( isset( $_GET['dcf_forms_preview'], $_GET['dcf_forms_iframe'], $_GET['form_id'] ) ) {
			if ( current_user_can( 'edit_pages' ) ) {
				wp_enqueue_script( 'jquery' );
				$template = DIALOG_CONTACT_FORM_TEMPLATES . '/public/preview-form.php';
			}
		}

		return $template;
	}
}
