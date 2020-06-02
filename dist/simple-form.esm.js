/*!
 * Client Side Validations Simple Form JS (Default) - v0.1.3 (https://github.com/DavyJonesLocker/client_side_validations-simple_form)
 * Copyright (c) 2020 Geremia Taglialatela, Brian Cardarella
 * Licensed under MIT (https://opensource.org/licenses/mit-license.php)
 */

import $$1 from 'jquery';
import ClientSideValidations$1 from '@client-side-validations/client-side-validations';

function checkedInputsCount(element) {
  var formSettings = element.closest('form[data-client-side-validations]').data('clientSideValidations');
  var wrapperClass = formSettings.html_settings.wrapper_class;
  return element.closest(".".concat(wrapperClass.replace(/ /g, '.'))).find('input:checked').length;
}

var originalLengthValidator = ClientSideValidations$1.validators.local.length;
var VALIDATIONS = {
  is: function is(a, b) {
    return a === parseInt(b, 10);
  },
  minimum: function minimum(a, b) {
    return a >= parseInt(b, 10);
  },
  maximum: function maximum(a, b) {
    return a <= parseInt(b, 10);
  }
};

var runValidations = function runValidations(valueLength, options) {
  for (var validation in VALIDATIONS) {
    var validationOption = options[validation];
    var validationFunction = VALIDATIONS[validation];

    if (validationOption && !validationFunction(valueLength, validationOption)) {
      return options.messages[validation];
    }
  }
};

ClientSideValidations$1.validators.local.length = function (element, options) {
  if (element.attr('type') === 'checkbox') {
    var count = checkedInputsCount(element);

    if (options.allow_blank && count === 0) {
      return;
    }

    return runValidations(count, options);
  } else {
    return originalLengthValidator(element, options);
  }
};

var originalPresenceValidator = ClientSideValidations$1.validators.local.presence;

ClientSideValidations$1.validators.local.presence = function (element, options) {
  if (element.attr('type') === 'checkbox' || element.attr('type') === 'radio') {
    if (checkedInputsCount(element) === 0) {
      return options.message;
    }
  } else {
    return originalPresenceValidator(element, options);
  }
};

// It could be fixed in main CSV if radio_buttons validations are needed there and
// in that case we may removed it from here

var originalInputEnabler = window.ClientSideValidations.enablers.input;

window.ClientSideValidations.enablers.input = function (input) {
  originalInputEnabler(input);
  var $input = $$1(input);
  var form = input.form;
  var eventsToBind = window.ClientSideValidations.eventsToBind.input(form);
  var wrapperClass = form.ClientSideValidations.settings.html_settings.wrapper_class;

  for (var eventName in eventsToBind) {
    var eventFunction = eventsToBind[eventName];
    $input.filter(':radio').each(function () {
      return $$1(this).attr('data-validate', true);
    }).on(eventName, eventFunction);
  }

  $input.filter(':radio').on('change.ClientSideValidations', function () {
    $$1(this).isValid(form.ClientSideValidations.settings.validators);
  }); // when we change radio/check mark also all sibling radios/checkboxes as changed to revalidate on submit

  $input.filter(':radio,:checkbox').on('change.ClientSideValidations', function () {
    $$1(this).closest(".".concat(wrapperClass.replace(/ /g, '.'))).find(':radio,:checkbox').data('changed', true);
  });
};

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

$.fn.isValid = function (validators) {
  var obj = $(this[0]);

  if (obj.is('form')) {
    return validateForm(obj, validators);
  } else {
    return validateElement(obj, validatorsFor(this[0].name, validators));
  }
};

var cleanNestedElementName = function cleanNestedElementName(elementName, nestedMatches, validators) {
  for (var validatorName in validators) {
    if (validatorName.match('\\[' + nestedMatches[1] + '\\].*\\[\\]\\[' + nestedMatches[2] + '\\]$')) {
      elementName = elementName.replace(/\[[\da-z_]+\]\[(\w+)\]$/g, '[][$1]');
    }
  }

  return elementName;
};

var cleanElementName = function cleanElementName(elementName, validators) {
  elementName = elementName.replace(/\[(\w+_attributes)\]\[[\da-z_]+\](?=\[(?:\w+_attributes)\])/g, '[$1][]');
  elementName = elementName.replace(/\(\di\)/g, ''); // date/time_select (1/2/3/4/5i) fields

  elementName = elementName.replace(/\]\[\]$/g, ']'); // fix many association collections

  var nestedMatches = elementName.match(/\[(\w+_attributes)\].*\[(\w+)\]$/);

  if (nestedMatches) {
    elementName = cleanNestedElementName(elementName, nestedMatches, validators);
  }

  return elementName;
};

var validatorsFor = function validatorsFor(elementName, validators) {
  if (Object.prototype.hasOwnProperty.call(validators, elementName)) {
    return validators[elementName];
  }

  return validators[cleanElementName(elementName, validators)] || {};
};

var validateForm = function validateForm(form, validators) {
  var valid = true;
  form.trigger('form:validate:before.ClientSideValidations');
  form.find(ClientSideValidations.selectors.validate_inputs).each(function () {
    if (!$(this).isValid(validators)) {
      valid = false;
    }

    return true;
  });

  if (valid) {
    form.trigger('form:validate:pass.ClientSideValidations');
  } else {
    form.trigger('form:validate:fail.ClientSideValidations');
  }

  form.trigger('form:validate:after.ClientSideValidations');
  return valid;
};

var passElement = function passElement(element) {
  element.trigger('element:validate:pass.ClientSideValidations').data('valid', null);
};

var failElement = function failElement(element, message) {
  element.trigger('element:validate:fail.ClientSideValidations', message).data('valid', false);
};

var afterValidate = function afterValidate(element) {
  return element.trigger('element:validate:after.ClientSideValidations').data('valid') !== false;
};

var executeValidator = function executeValidator(validatorFunctions, validatorFunction, validatorOptions, element) {
  for (var validatorOption in validatorOptions) {
    if (!validatorOptions[validatorOption]) {
      continue;
    }

    var message = validatorFunction.call(validatorFunctions, element, validatorOptions[validatorOption]);

    if (message) {
      failElement(element, message);
      return false;
    }
  }

  return true;
};

var executeValidators = function executeValidators(validatorFunctions, element, validators) {
  for (var validator in validators) {
    if (!validatorFunctions[validator]) {
      continue;
    }

    if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], element)) {
      return false;
    }
  }

  return true;
};

var isMarkedForDestroy = function isMarkedForDestroy(element) {
  if (element.attr('name').search(/\[([^\]]*?)\]$/) >= 0) {
    var destroyInputName = element.attr('name').replace(/\[([^\]]*?)\]$/, '[_destroy]');

    if ($("input[name='" + destroyInputName + "']").val() === '1') {
      return true;
    }
  }

  return false;
};

var executeAllValidators = function executeAllValidators(element, validators) {
  if (element.data('changed') === false || element.prop('disabled')) {
    return;
  }

  element.data('changed', false);

  if (executeValidators(ClientSideValidations.validators.all(), element, validators)) {
    passElement(element);
  }
};

var validateElement = function validateElement(element, validators) {
  element.trigger('element:validate:before.ClientSideValidations');

  if (isMarkedForDestroy(element)) {
    passElement(element);
  } else {
    executeAllValidators(element, validators);
  }

  return afterValidate(element);
};

if (!window.ClientSideValidations) {
  window.ClientSideValidations = ClientSideValidations;

  if (!isAMD() && !isCommonJS()) {
    ClientSideValidations.start();
  }
}

function isAMD() {
  return typeof define === 'function' && define.amd; // eslint-disable-line no-undef
}

function isCommonJS() {
  return (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined'; // eslint-disable-line no-undef
}

ClientSideValidations$1.formBuilders['SimpleForm::FormBuilder'] = {
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
        var wrapper = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.'));
        var errorElement = wrapper.find(settings.error_tag + '.' + settings.error_class.replace(/ /g, '.'));

        if (!errorElement.length) {
          errorElement = $$1('<' + settings.error_tag + '>', {
            "class": settings.error_class,
            text: message
          });

          if (wrapper.hasClass('check_boxes') || wrapper.hasClass('radio_buttons')) {
            element.closest('.checkbox,.radio').parent().children('.checkbox:last, .radio:last').after(errorElement);
          } else {
            wrapper.append(errorElement);
          }
        }

        wrapper.addClass(settings.wrapper_error_class);
        return errorElement.text(message);
      },
      remove: function remove(element, settings) {
        var wrapper = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.') + '.' + settings.wrapper_error_class);
        var errorElement = wrapper.find(settings.error_tag + '.' + settings.error_class.replace(/ /g, '.'));
        wrapper.removeClass(settings.wrapper_error_class);
        return errorElement.remove();
      }
    }
  }
};
