import ClientSideValidations from '@client-side-validations/client-side-validations'

const originalPresenceValidator = ClientSideValidations.validators.local.presence

ClientSideValidations.validators.local.presence = function (element, options) {
  if (element.attr('type') === 'checkbox') {
    const formSettings = element.closest('form[data-client-side-validations]').data('clientSideValidations')
    const wrapperTag = formSettings.html_settings.wrapper_tag
    const wrapperClass = formSettings.html_settings.wrapper_class

    if (element.closest(wrapperTag + '.' + wrapperClass.replace(/ /g, '.')).find('input[type="checkbox"]:checked').length === 0) {
      return options.message
    }
  } else {
    return originalPresenceValidator(element, options)
  }
}
