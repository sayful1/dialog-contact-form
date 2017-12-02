(function () {
    "use strict";
    var forms,
        form,
        helpText,
        formData,
        request,
        allFields,
        fields,
        errors,
        error,
        success,
        dcfSuccess,
        dcfError,
        submitBtn,
        i;

    // Stop working if formData is not supported
    if (!window.FormData) {
        return;
    }

    // Get all contact form
    forms = document.querySelectorAll('.dcf-form');
    Array.prototype.forEach.call(forms, function (el) {
        el.addEventListener('submit', function (e) {
            // Prevent default form behavior
            e.preventDefault();

            form = this;
            dcfSuccess = form.querySelector('.dcf-response > .dcf-success');
            dcfError = form.querySelector('.dcf-response > .dcf-error');
            submitBtn = form.querySelector('.dcf-submit');

            // Add loading class to submit button
            submitBtn.classList.add('is-loading');

            // Hide success message if any
            dcfSuccess.innerHTML = '';
            // Hide error message if any
            dcfError.innerHTML = '';

            // Hide field help message if any
            helpText = form.querySelectorAll('.help');
            for (i = 0; i < helpText.length; i++) {
                helpText[i].parentNode.removeChild(helpText[i]);
            }

            // Remove field validation border-color if any
            allFields = form.querySelectorAll('.input, .textarea, .select select');
            for (i = 0; i < allFields.length; i++) {
                allFields[i].style.borderColor = '';
            }

            // Get form fields data
            formData = new FormData(form);
            // Add action params with form data
            formData.append('action', 'dcf_submit_form');
            // Add nonce field with form data
            formData.append('nonce', DialogContactForm.nonce);

            request = new XMLHttpRequest();
            request.open("POST", DialogContactForm.ajaxurl, true);
            request.onload = function () {
                if (request.status === 200) {
                    // Remove loading class from submit button
                    submitBtn.classList.remove('is-loading');
                    // Get success message and print on success div
                    success = JSON.parse(request.responseText);
                    dcfSuccess.innerHTML = '<p>' + success.message + '</p>';
                    // Remove form fields value
                    form.reset();
                } else {
                    // Remove loading class from submit button
                    submitBtn.classList.remove('is-loading');
                    // Get error message
                    errors = JSON.parse(request.responseText);

                    if (errors.message) {
                        dcfError.innerHTML = '<p>' + errors.message + '</p>';
                    }

                    // Loop through all fields and print field error message if any
                    if (errors.validation) {
                        for (i = 0; i < errors.validation.length; i++) {
                            fields = form.querySelector('[name="' + errors.validation[i].field + '"]');

                            if (errors.validation[i].message[0]) {
                                error = '<span class="help is-danger">' + errors.validation[i].message[0] + '</span>';
                                fields.style.borderColor = '#f44336';
                                fields.insertAdjacentHTML('afterend', error);
                            }
                        }
                    }
                }
            };
            request.send(formData);
        }, false);
    });
})();

/*
 * Modal
 */
(function () {
    'use strict';
    var target,
        modal,
        modals = document.querySelectorAll('[data-toggle="modal"]'),
        dismiss = document.querySelectorAll('[data-dismiss="modal"]');
    if (modals.length < 1) {
        return;
    }
    Array.prototype.forEach.call(modals, function (el, i) {
        el.addEventListener('click', function (event) {
            event.preventDefault();
            target = el.getAttribute('data-target');
            modal = document.querySelector(target);
            if (!modal) {
                return;
            }
            addClass(modal, 'is-active');
        });
    });
    if (dismiss.length < 1) {
        return;
    }
    Array.prototype.forEach.call(dismiss, function (el, i) {
        el.addEventListener('click', function (event) {
            event.preventDefault();
            var closestModal = el.closest('.modal');
            if (!closestModal) {
                return;
            }
            removeClass(modal, 'is-active');
        });
    });
    // polyfill for closest
    if (window.Element && !Element.prototype.closest) {
        Element.prototype.closest =
            function (s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i,
                    el = this;
                do {
                    i = matches.length;
                    while (--i >= 0 && matches.item(i) !== el) {
                    }
                } while ((i < 0) && (el = el.parentElement));
                return el;
            };
    }

    function hasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        }
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }

    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className)
        }
        else if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }

    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className)
        }
        else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }
})();