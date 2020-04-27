/*!
 * Client Side Validations Simple Form JS (Default) - v0.1.2 (https://github.com/DavyJonesLocker/client_side_validations-simple_form)
 * Copyright (c) 2020 Geremia Taglialatela, Brian Cardarella
 * Licensed under MIT (https://opensource.org/licenses/mit-license.php)
 */

import $ from 'jquery';
import ClientSideValidations from '@client-side-validations/client-side-validations';

var originalPresenceValidator = ClientSideValidations.validators.local.presence;

ClientSideValidations.validators.local.presence = function (element, options) {
  if (element.attr('type') === 'checkbox') {
    var formSettings = element.closest('form[data-client-side-validations]').data('clientSideValidations');
    var wrapperTag = formSettings.html_settings.wrapper_tag;
    var wrapperClass = formSettings.html_settings.wrapper_class;

    if (element.closest(wrapperTag + '.' + wrapperClass.replace(/ /g, '.')).find('input[type="checkbox"]:checked').length === 0) {
      return options.message;
    }
  } else {
    return originalPresenceValidator(element, options);
  }
};

ClientSideValidations.formBuilders['SimpleForm::FormBuilder'] = {
  add: function add(element, settings, message) {
    this.wrapper(this.wrapperName(element, settings)).add.call(this, element, settings, message);
  },
  remove: function remove(element, settings) {
    this.wrapper(this.wrapperName(element, settings)).remove.call(this, element, settings);
  },
  wrapper: function wrapper(name) {
    return this.wrappers[name] || this.wrappers["default"];
  },
  wrapperName: function wrapperName(element, settings) {
    return element.data('clientSideValidationsWrapper') || settings.wrapper;
  },
  wrappers: {
    "default": {
      add: function add(element, settings, message) {
        var wrapperElement = element.parent();
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback');

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', {
            "class": 'invalid-feedback',
            text: message
          });
          wrapperElement.append(errorElement);
        }

        wrapperElement.addClass(settings.wrapper_error_class);
        element.addClass('is-invalid');
        errorElement.text(message);
      },
      remove: function remove(element, settings) {
        var wrapperElement = element.parent();
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback');
        wrapperElement.removeClass(settings.wrapper_error_class);
        element.removeClass('is-invalid');
        errorElement.remove();
      }
    },

    get horizontal_multi_select() {
      return this.multi_select;
    },

    get vertical_multi_select() {
      return this.multi_select;
    },

    multi_select: {
      add: function add(element, settings, message) {
        var wrapperElement = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.'));
        var parentElement = element.parent();
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback');

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', {
            "class": 'invalid-feedback d-block',
            text: message
          });
          parentElement.after(errorElement);
        }

        wrapperElement.addClass(settings.wrapper_error_class);
        element.addClass('is-invalid');
        errorElement.text(message);
      },
      remove: function remove(element, settings) {
        var wrapperElement = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.'));
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback');
        var invalidSiblingExists = element.siblings('.is-invalid').length;

        if (!invalidSiblingExists) {
          wrapperElement.removeClass(settings.wrapper_error_class);
          errorElement.remove();
        }

        element.removeClass('is-invalid');
      }
    },
    vertical_collection: {
      add: function add(element, settings, message) {
        var wrapperElement = element.closest('.' + settings.wrapper_class.replace(/ /g, '.'));
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback');

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', {
            "class": 'invalid-feedback d-block',
            text: message
          });
          wrapperElement.append(errorElement);
        }

        wrapperElement.addClass(settings.wrapper_error_class);
        element.addClass('is-invalid');
        errorElement.text(message);
      },
      remove: function remove(element, settings) {
        var wrapperElement = element.closest('.' + settings.wrapper_class.replace(/ /g, '.'));
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback');
        wrapperElement.removeClass(settings.wrapper_error_class);
        errorElement.remove();
        element.removeClass('is-invalid');
      }
    }
  }
};
