<?php

use DialogContactForm\Collections\Templates;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$templateManager = Templates::init();
$templates       = $templateManager->getTemplatesByPriority();
?>
<div id="modal-form-template" class="modal">
    <div class="modal-background"></div>
    <div class="modal-card">
        <div class="modal-card-head">
            <p class="modal-card-title">
				<?php esc_html_e( 'Select a Template', 'dialog-contact-form' ); ?>
            </p>
            <button class="modal-close" data-dismiss="modal"></button>
        </div>
        <div class="modal-card-body">
            <div class="dcf-columns dcf-templates">
				<?php
				/** @var \DialogContactForm\Abstracts\Template $template */
				foreach ( $templates as $template ) {
					$url = add_query_arg( array(
						'action'   => 'dcf_new_form',
						'template' => $template->getId(),
					), admin_url( 'admin-ajax.php' ) );
					echo '<div class="dcf-column is-6">';
					echo '<a class="dcf-template" href="' . esc_url( $url ) . '">';
					echo '<h3 class="dcf-template-title">' . $template->getTitle() . '</h3>';
					echo '<p class="dcf-template-description">' . $template->getDescription() . '</p>';
					echo '</a>';
					echo '</div>';
				}
				?>
            </div>
        </div>
    </div>
</div>