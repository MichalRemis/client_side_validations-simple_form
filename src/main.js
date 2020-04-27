import $ from 'jquery'
import ClientSideValidations from '@client-side-validations/client-side-validations'
import './validator_overrides/index'

ClientSideValidations.formBuilders['SimpleForm::FormBuilder'] = {
  add: function (element, settings, message) {
    this.wrapper(this.wrapperName(element, settings)).add.call(this, element, settings, message)
  },
  remove: function (element, settings) {
    this.wrapper(this.wrapperName(element, settings)).remove.call(this, element, settings)
  },
  wrapper: function (name) {
    return this.wrappers[name] || this.wrappers.default
  },
  wrapperName: function (element, settings) {
    return element.data('clientSideValidationsWrapper') || settings.wrapper
  },

  wrappers: {
    default: {
      add (element, settings, message) {
        const wrapper = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.'))
        var errorElement = wrapper.find(settings.error_tag + '.' + settings.error_class.replace(/ /g, '.'))

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', { class: settings.error_class, text: message })

          if (wrapper.hasClass('check_boxes') || wrapper.hasClass('radio_buttons')) {
            element.closest('.checkbox,.radio').parent().children('.checkbox:last, .radio:last').after(errorElement)
          } else {
            wrapper.append(errorElement)
          }
        }

        wrapper.addClass(settings.wrapper_error_class)
        return errorElement.text(message)
      },

      remove (element, settings) {
        const wrapper = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.') + '.' + settings.wrapper_error_class)
        const errorElement = wrapper.find(settings.error_tag + '.' + settings.error_class.replace(/ /g, '.'))

        wrapper.removeClass(settings.wrapper_error_class)
        return errorElement.remove()
      }
    },
    get horizontal_multi_select () {
      return this.multi_select
    },
    get vertical_multi_select () {
      return this.multi_select
    },
    multi_select: {
      add (element, settings, message) {
        const wrapperElement = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.'))
        const parentElement = element.parent()
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback')

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', { class: 'invalid-feedback d-block', text: message })
          parentElement.after(errorElement)
        }

        wrapperElement.addClass(settings.wrapper_error_class)
        element.addClass('is-invalid')
        errorElement.text(message)
      },
      remove (element, settings) {
        const wrapperElement = element.closest(settings.wrapper_tag + '.' + settings.wrapper_class.replace(/ /g, '.'))
        const errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback')

        const invalidSiblingExists = element.siblings('.is-invalid').length
        if (!invalidSiblingExists) {
          wrapperElement.removeClass(settings.wrapper_error_class)
          errorElement.remove()
        }

        element.removeClass('is-invalid')
      }
    }
  }
}
