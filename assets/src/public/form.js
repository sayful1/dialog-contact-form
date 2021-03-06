/**
 * Element.classList.add();
 */
(function () {
    'use strict';

    let settings = window.DialogContactForm || {
        ajaxurl: '/wp-admin/admin-ajax.php',
        nonce: '',
        // Classes and Selectors
        selector: '.dcf-form',
        fieldClass: '.dcf-has-error',
        errorClass: '.dcf-error-message',
        loadingClass: '.is-loading',
        submitBtnClass: '.dcf-submit',

        // Messages
        invalid_required: 'Please fill out this field.',
        required_select: 'Please select a value.',
        required_select_multi: 'Please select at least one value.',
        required_checkbox: 'Please check this field.',
        invalid_email: 'Please enter an email address.',
        invalid_url: 'Please enter a URL.',
        invalid_too_short: 'Please lengthen this text to {minLength} characters or more. ' +
            'You are currently using {length} characters.',
        invalid_too_long: 'Please shorten this text to no more than {maxLength} characters. ' +
            'You are currently using {length} characters.',
        pattern_mismatch: 'Please match the requested format.',
        bad_input: 'Please enter a number.',
        step_mismatch: 'Please select a valid value.',
        number_too_large: 'Please select a value that is no more than {max}.',
        number_too_small: 'Please select a value that is no less than {min}.',
        generic_error: 'The value you entered for this field is invalid.',
    };

    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    }

    /**
     * Polyfill for browsers that do not support Element.closest(), but
     * carry support for element.matches() (or a prefixed equivalent, meaning IE9+)
     */
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement;
            } while (el !== null);
            return null;
        };
    }

    const getClassName = function (className) {
        return className.replace('.', '').replace('#', '');
    };

    /**
     * Validate the field
     * @param field
     * @returns {string}
     */
    const hasError = function (field) {

        // Merge user options with existing settings or defaults
        let localSettings = settings;

        // Don't validate file and disabled fields
        if (field.disabled || field.type === 'file') return;

        // Don't validate submits, buttons and reset inputs fields
        if (field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

        // Get validity
        var validity = field.validity;

        // If valid, return null
        if (validity.valid) return;

        // If field is required and empty
        // if (validity.valueMissing) return 'Please fill out this field.';
        if (validity.valueMissing) {
            if (field.type === 'select-multiple') return localSettings.required_select_multi;
            if (field.type === 'select-one') return localSettings.required_select;
            if (field.type === 'radio') return localSettings.required_select;
            if (field.type === 'checkbox') return localSettings.required_checkbox;
            return localSettings.invalid_required;
        }

        // If not the right type
        if (validity.typeMismatch) {

            // Email
            if (field.type === 'email') return localSettings.invalid_email;

            // URL
            if (field.type === 'url') return localSettings.invalid_url;

        }

        // If too short
        if (validity.tooShort)
            return localSettings.invalid_too_short
                .replace('{minLength}', field.getAttribute('minLength')).replace('{length}', field.value.length);

        // If too long
        if (validity.tooLong) return localSettings.invalid_too_long
            .replace('{minLength}', field.getAttribute('maxLength')).replace('{length}', field.value.length);

        // If number input isn't a number
        if (validity.badInput) return localSettings.bad_input;

        // If a number value doesn't match the step interval
        if (validity.stepMismatch) return localSettings.step_mismatch;

        // If a number field is over the max
        if (validity.rangeOverflow) return localSettings.number_too_large.replace('{max}', field.getAttribute('max'));

        // If a number field is below the min
        if (validity.rangeUnderflow) return localSettings.number_too_small.replace('{min}', field.getAttribute('min'));

        // If pattern doesn't match
        if (validity.patternMismatch) {

            // If pattern info is included, return custom error
            if (field.hasAttribute('title')) return field.getAttribute('title');

            // Otherwise, generic error
            return localSettings.pattern_mismatch;

        }

        // If all else fails, return a generic catchall error
        return localSettings.generic_error;
    };


    /**
     * Show an error message
     *
     * @param field
     * @param error
     */
    const showError = function (field, error) {

        // Merge user options with existing settings or defaults
        var localSettings = settings,
            fieldClass = getClassName(localSettings.fieldClass),
            errorClass = getClassName(localSettings.errorClass);

        // Add error class to field
        field.classList.add(fieldClass);

        // If the field is a radio button and part of a group, error all and get the last item in the group
        if ((field.type === 'radio' || field.type === 'checkbox') && field.name) {
            var group = document.getElementsByName(field.name);
            if (group.length > 0) {
                for (var i = 0; i < group.length; i++) {
                    // Only check fields in current form
                    if (group[i].form !== field.form) continue;
                    group[i].classList.add(fieldClass);
                }
                field = group[group.length - 1];
            }
        }

        // Get field id or name
        var id = field.id || field.name;
        if (!id) return;

        // Check if error message field already exists
        // If not, create one
        var message = field.form.querySelector('.' + errorClass + '#error-for-' + id);
        if (!message) {
            message = document.createElement('div');
            message.className = errorClass;
            message.id = 'error-for-' + id;

            // If the field is a radio button or checkbox, insert error after the label
            var label;
            if (field.type === 'radio' || field.type === 'checkbox') {
                label = field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
                if (label) {
                    label.parentNode.insertBefore(message, label.nextSibling);
                }
            }

            // Otherwise, insert it after the field
            if (!label) {
                field.parentNode.insertBefore(message, field.nextSibling);
            }

        }

        // Add ARIA role to the field
        field.setAttribute('aria-describedby', 'error-for-' + id);

        // Update error message
        message.innerHTML = error;

        // Show error message
        message.style.display = 'block';
        message.style.visibility = 'visible';
    };


    /**
     * Remove the error message
     *
     * @param field
     */
    const removeError = function (field) {

        // Merge user options with existing settings or defaults
        var localSettings = settings,
            fieldClass = getClassName(localSettings.fieldClass),
            errorClass = getClassName(localSettings.errorClass);

        // Remove error class to field
        field.classList.remove(fieldClass);

        // Remove ARIA role from the field
        field.removeAttribute('aria-describedby');

        // If the field is a radio button and part of a group, remove error from all and get the last item in the group
        if ((field.type === 'radio' || field.type === 'checkbox') && field.name) {
            var group = document.getElementsByName(field.name);
            if (group.length > 0) {
                for (var i = 0; i < group.length; i++) {
                    // Only check fields in current form
                    if (group[i].form !== field.form) continue;
                    group[i].classList.remove(fieldClass);
                }
                field = group[group.length - 1];
            }
        }

        // Get field id or name
        var id = field.id || field.name;
        if (!id) return;


        // Check if an error message is in the DOM
        var message = field.form.querySelector('.' + errorClass + '#error-for-' + id + '');
        if (!message) return;

        // If so, hide it
        message.innerHTML = '';
        message.style.display = 'none';
        message.style.visibility = 'hidden';
    };

    /**
     * Check if form element
     *
     * @param {Event} event
     * @returns {boolean}
     */
    const isFormElement = function (event) {
        return event.target.form && event.target.form.classList.contains(getClassName(settings.selector))
    };

    /**
     * Check field validity when it loses focus
     * @private
     * @param  {Event} event The blur event
     */
    const blurHandler = function (event) {

        // Only run if the field is in a form to be validated
        if (!isFormElement(event)) return;

        // Validate the field
        let error = hasError(event.target);

        // If there's an error, show it
        if (error) {
            showError(event.target, error);
            return;
        }

        // Otherwise, remove any existing error message
        removeError(event.target);
    };

    /**
     * Check radio and checkbox field validity when clicked
     * @private
     * @param  {Event} event The click event
     */
    const clickHandler = function (event) {

        // Only run if the field is in a form to be validated
        if (!isFormElement(event)) return;

        // Only run if the field is a checkbox or radio
        let type = event.target.getAttribute('type');
        if (!(type === 'checkbox' || type === 'radio')) return;

        // Validate the field
        let error = hasError(event.target);

        // If there's an error, show it
        if (error) {
            showError(event.target, error);
            return;
        }

        // Otherwise, remove any errors that exist
        removeError(event.target);
    };

    const showServerError = function (form, errors) {
        let vMessages, field_name, fields, control, messages, error;

        // Get error message and print on error div
        if (errors.message) {
            form.querySelector('.dcf-error').innerHTML = '<p>' + errors.message + '</p>';
        }

        // Loop through all fields and print field error message if any
        vMessages = errors.validation && typeof errors.validation === 'object' ? errors.validation : {};
        for (field_name in vMessages) {
            if (vMessages.hasOwnProperty(field_name)) {
                fields = form.querySelector('[name="' + field_name + '"]');
                if (!fields) {
                    fields = form.querySelector('[name="' + field_name + '[]"]');
                }
                control = fields.closest('.dcf-control');
                messages = vMessages[field_name];
                if (messages[0]) {
                    fields.classList.add(getClassName(settings.fieldClass));
                    error = '<div class="' + getClassName(settings.errorClass) + '">' + messages[0] + '</div>';
                    control.insertAdjacentHTML('beforeend', error);
                }
            }
        }
    };

    const removeAllErrors = function (form) {
        // Hide success message if any
        form.querySelector('.dcf-success').innerHTML = '';
        // Hide error message if any
        form.querySelector('.dcf-error').innerHTML = '';

        // Hide field help message if any
        let helpText = form.querySelectorAll('.' + getClassName(settings.errorClass));
        for (let i = 0; i < helpText.length; i++) {
            helpText[i].parentNode.removeChild(helpText[i]);
        }

        // Remove field validation border-color if any
        let allFields = form.querySelectorAll('.input, .textarea, .select select');
        for (let i = 0; i < allFields.length; i++) {
            allFields[i].classList.remove(getClassName(settings.fieldClass));
        }
    };

    const isURL = function (str) {
        let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return pattern.test(str);
    };

    /**
     * Submit form data
     *
     * @param {element} form
     * @param {string} url
     * @returns {Promise<unknown>}
     */
    const submitFormData = function (form, url) {
        return new Promise((resolve, reject) => {
            // Get form fields data
            let formData = new FormData(form);
            // Add action params with form data
            formData.append('action', 'dcf_submit_form');

            let request = new XMLHttpRequest();

            // Define what happens on successful data submission
            request.addEventListener("load", event => {

                let xhr = event.target, response = JSON.parse(xhr.responseText);

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(response);
                } else {
                    reject(response);
                }
            });

            // Set up our request
            request.open("POST", url, true);

            // The data sent is what the user provided in the form
            request.send(formData);
        });
    };

    /**
     * Check all fields on submit
     * @private
     * @param  {Event} event  The submit event
     */
    const submitHandler = function (event) {

        // Only run on forms flagged for validation
        if (!event.target.classList.contains(getClassName(settings.selector))) return;

        // Prevent form from submitting if there are errors or submission is disabled
        event.preventDefault();

        // Get all of the form elements
        let form = event.target, fields = form.elements;

        // Validate each field
        // Store the first field with an error to a variable so we can bring it into focus later
        let hasErrors;
        for (let i = 0; i < fields.length; i++) {
            let error = hasError(fields[i]);
            if (error) {
                showError(fields[i], error);
                if (!hasErrors) {
                    hasErrors = fields[i];
                }
            }
        }

        // If there are errors, focus on first element with error
        if (hasErrors) {
            hasErrors.focus();
            return;
        }

        let dcfSuccess = form.querySelector('.dcf-success'),
            submitBtn = form.querySelector('.' + getClassName(settings.submitBtnClass)),
            loadingClass = getClassName(settings.loadingClass);

        // Add loading class to submit button
        submitBtn.classList.add(loadingClass);

        removeAllErrors(form);

        submitFormData(form, settings.ajaxurl).then(response => {
            submitBtn.classList.remove(loadingClass);
            let actions = response.actions ? response.actions : {};
            // Remove form fields value
            if (response.reset_form) {
                form.reset();
            }

            for (let action in actions) {
                if (actions.hasOwnProperty(action)) {
                    // Get success message and print on success div
                    if ('success_message' === action) {
                        dcfSuccess.innerHTML = '<p>' + actions[action] + '</p>';
                    }
                    if ('redirect' === action && isURL(actions[action])) {
                        setTimeout(function (url) {
                            window.location.href = url;
                        }, 1000, actions[action]);
                    }
                }
            }
        }).catch(error => {
            submitBtn.classList.remove(loadingClass);
            showServerError(form, error);
        });
    };

    /**
     * Listen to all events
     */
    document.addEventListener('blur', blurHandler, true);
    document.addEventListener('click', clickHandler, true);
    document.addEventListener('submit', submitHandler, false);
})();