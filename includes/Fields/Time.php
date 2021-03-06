<?php

namespace DialogContactForm\Fields;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Time extends Text {

	/**
	 * Metabox fields
	 *
	 * @var array
	 */
	protected $metabox_fields = array(
		'field_type',
		'field_title',
		'placeholder',
		'required_field',
		'field_width',
		'field_id',
		'field_class',
		'native_html5',
		'autocomplete',
	);

	/**
	 * Text constructor.
	 */
	public function __construct() {
		$this->admin_id    = 'time';
		$this->admin_label = __( 'Time', 'dialog-contact-form' );
		$this->admin_icon  = '<svg><use href="#dcf-icon-time"></use></svg>';
		$this->priority    = 100;
		$this->input_class = 'dcf-input dcf-input-time';
		$this->type        = 'time';
		$this->init_form_fields();
	}

	/**
	 * Validate field value
	 *
	 * @param mixed $value
	 *
	 * @return bool
	 */
	public function validate( $value ) {
		// Validate 24 hour format
		if ( preg_match( "/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/", $value ) ) {
			return true;
		}

		return (bool) preg_match( '/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/i', $value );
	}

	/**
	 * Initialise settings form fields.
	 *
	 * Add an array of fields to be displayed on the form settings screen.
	 */
	public function init_form_fields() {
		parent::init_form_fields();

		$this->form_fields['native_html5'] = [
			'type'    => 'buttonset',
			'label'   => __( 'Native HTML5', 'dialog-contact-form' ),
			'default' => 'on',
			'options' => array(
				'off' => esc_html__( 'No', 'dialog-contact-form' ),
				'on'  => esc_html__( 'Yes', 'dialog-contact-form' ),
			),
		];
	}
}

