
$.fn.isValid = function (validators) {
  const obj = $(this[0])

  if (obj.is('form')) {
    return validateForm(obj, validators)
  } else {
    return validateElement(obj, validatorsFor(this[0].name, validators))
  }
}

const cleanNestedElementName = (elementName, nestedMatches, validators) => {
  for (const validatorName in validators) {
    if (validatorName.match('\\[' + nestedMatches[1] + '\\].*\\[\\]\\[' + nestedMatches[2] + '\\]$')) {
      elementName = elementName.replace(/\[[\da-z_]+\]\[(\w+)\]$/g, '[][$1]')
    }
  }

  return elementName
}

const cleanElementName = (elementName, validators) => {
  elementName = elementName.replace(/\[(\w+_attributes)\]\[[\da-z_]+\](?=\[(?:\w+_attributes)\])/g, '[$1][]')
  elementName = elementName.replace(/\(\di\)/g, '') // date/time_select (1/2/3/4/5i) fields
  elementName = elementName.replace(/\]\[\]$/g, ']') // fix many association collections

  const nestedMatches = elementName.match(/\[(\w+_attributes)\].*\[(\w+)\]$/)

  if (nestedMatches) {
    elementName = cleanNestedElementName(elementName, nestedMatches, validators)
  }

  return elementName
}

const validatorsFor = (elementName, validators) => {
  if (Object.prototype.hasOwnProperty.call(validators, elementName)) {
    return validators[elementName]
  }

  return validators[cleanElementName(elementName, validators)] || {}
}

const validateForm = (form, validators) => {
  let valid = true

  form.trigger('form:validate:before.ClientSideValidations')

  form.find(ClientSideValidations.selectors.validate_inputs).each(function () {
    if (!$(this).isValid(validators)) {
      valid = false
    }

    return true
  })

  if (valid) {
    form.trigger('form:validate:pass.ClientSideValidations')
  } else {
    form.trigger('form:validate:fail.ClientSideValidations')
  }

  form.trigger('form:validate:after.ClientSideValidations')

  return valid
}

const passElement = (element) => {
  element.trigger('element:validate:pass.ClientSideValidations').data('valid', null)
}

const failElement = (element, message) => {
  element.trigger('element:validate:fail.ClientSideValidations', message).data('valid', false)
}

const afterValidate = (element) => {
  return element.trigger('element:validate:after.ClientSideValidations').data('valid') !== false
}

const executeValidator = (validatorFunctions, validatorFunction, validatorOptions, element) => {
  for (const validatorOption in validatorOptions) {
    if (!validatorOptions[validatorOption]) {
      continue
    }

    const message = validatorFunction.call(validatorFunctions, element, validatorOptions[validatorOption])

    if (message) {
      failElement(element, message)
      return false
    }
  }

  return true
}

const executeValidators = (validatorFunctions, element, validators) => {
  for (const validator in validators) {
    if (!validatorFunctions[validator]) {
      continue
    }

    if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], element)) {
      return false
    }
  }

  return true
}

const isMarkedForDestroy = (element) => {
  if (element.attr('name').search(/\[([^\]]*?)\]$/) >= 0) {
    const destroyInputName = element.attr('name').replace(/\[([^\]]*?)\]$/, '[_destroy]')

    if ($("input[name='" + destroyInputName + "']").val() === '1') {
      return true
    }
  }

  return false
}

const executeAllValidators = (element, validators) => {
  if (element.data('changed') === false || element.prop('disabled')) {
    return
  }

  element.data('changed', false)

  if (executeValidators(ClientSideValidations.validators.all(), element, validators)) {
    passElement(element)
  }
}

const validateElement = (element, validators) => {
  element.trigger('element:validate:before.ClientSideValidations')

  if (isMarkedForDestroy(element)) {
    passElement(element)
  } else {
    executeAllValidators(element, validators)
  }

  return afterValidate(element)
}

if (!window.ClientSideValidations) {
  window.ClientSideValidations = ClientSideValidations

  if (!isAMD() && !isCommonJS()) {
    ClientSideValidations.start()
  }
}

function isAMD () {
  return typeof define === 'function' && define.amd // eslint-disable-line no-undef
}

function isCommonJS () {
  return typeof exports === 'object' && typeof module !== 'undefined' // eslint-disable-line no-undef
}