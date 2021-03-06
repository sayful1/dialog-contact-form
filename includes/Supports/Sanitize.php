<?php

namespace DialogContactForm\Supports;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A simple wrapper class of static methods sanitizing value.
 *
 * @class Sanitize
 * @version 3.0.0
 */
class Sanitize {
	/**
	 * Sanitize number options.
	 *
	 * @param int|float|double|string $value The value to be sanitized.
	 *
	 * @return integer|double|string
	 */
	public static function number( $value ) {
		return ( is_numeric( $value ) ) ? $value : intval( $value );
	}

	/**
	 * Sanitize float number
	 *
	 * @param mixed $value
	 *
	 * @return float
	 */
	public static function float_number( $value ) {
		return floatval( $value );
	}

	/**
	 * Sanitize integer number
	 *
	 * @param mixed $value
	 *
	 * @return int
	 */
	public static function int_number( $value ) {
		return intval( $value );
	}

	/**
	 * Sanitize email
	 *
	 * @param  mixed $value
	 *
	 * @return string
	 */
	public static function email( $value ) {
		return sanitize_email( $value );
	}

	/**
	 * Sanitize url
	 *
	 * @param  mixed $value
	 *
	 * @return string
	 */
	public static function url( $value ) {
		return esc_url_raw( $value );
	}

	/**
	 * Sanitizes a string
	 *
	 * - Checks for invalid UTF-8,
	 * - Converts single `<` characters to entities
	 * - Strips all tags
	 * - Removes line breaks, tabs, and extra whitespace
	 * - Strips octets
	 *
	 * @param  mixed $value
	 *
	 * @return string
	 */
	public static function text( $value ) {
		return sanitize_text_field( $value );
	}

	/**
	 * Sanitizes a multiline string
	 *
	 * The function is like sanitize_text_field(), but preserves
	 * new lines (\n) and other whitespace, which are legitimate
	 * input in textarea elements.
	 *
	 * @param  mixed $value
	 *
	 * @return string
	 */
	public static function textarea( $value ) {
		if ( function_exists( 'sanitize_textarea_field' ) ) {
			return sanitize_textarea_field( $value );
		}

		return _sanitize_text_fields( $value, true );
	}

	/**
	 * If a field has been 'checked' or not, meaning it contains
	 * one of the following values: 'yes', 'on', '1', 1, true, or 'true'.
	 * This can be used for determining if an HTML checkbox has been checked.
	 *
	 * @param  mixed $value
	 *
	 * @return boolean
	 */
	public static function checked( $value ) {
		return in_array( $value, array( 'yes', 'on', '1', 1, true, 'true' ), true );
	}

	/**
	 * Sanitize short block html input
	 *
	 * @param $value
	 *
	 * @return string
	 */
	public static function html( $value ) {
		return wp_kses( $value, self::allowed_html_tags_short_block() );
	}

	/**
	 * Array of allowed html tags on short block
	 * @return array
	 */
	private static function allowed_html_tags_short_block() {
		$allowed_tags = array(
			'div'    => array(
				'class' => array(),
				'id'    => array(),
			),
			'span'   => array(
				'class' => array(),
				'id'    => array(),
			),
			'ol'     => array(
				'class' => array(),
				'id'    => array(),
			),
			'ul'     => array(
				'class' => array(),
				'id'    => array(),
			),
			'li'     => array(
				'class' => array(),
				'id'    => array(),
			),
			'p'      => array(
				'class' => array(),
				'id'    => array(),
			),
			'a'      => array(
				'href'   => array(),
				'class'  => array(),
				'id'     => array(),
				'rel'    => array(),
				'title'  => array(),
				'target' => array(),
			),
			'br'     => array(),
			'em'     => array(),
			'strong' => array(),
		);

		return apply_filters( 'dialog_contact_form/short_block_html_tags', $allowed_tags );
	}
}
