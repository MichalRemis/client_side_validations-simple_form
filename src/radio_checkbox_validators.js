import ClientSideValidations from '@client-side-validations/client-side-validations'

const originalPresenceValidator = ClientSideValidations.validators.local.presence

ClientSideValidations.validators.local.presence = (element, options) => {
  console.log(element);
  if (element.attr('type') === 'checkbox') {
    console.log(element);

    if (element.closest('.form-group').find('input[type="checkbox"]:checked').length === 0) {
      return options.message
    }
  } else {
    return originalPresenceValidator(element, options)
  }
}
