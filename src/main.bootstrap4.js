import $ from 'jquery'
import ClientSideValidations from '@client-side-validations/client-side-validations'
import './validator_overrides/index'
import './validator_overrides/main'

const simpleFormFormBuilder = {
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
        const wrapperElement = element.parent()
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback')

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', { class: 'invalid-feedback', text: message })
          wrapperElement.append(errorElement)
        }

        wrapperElement.addClass(settings.wrapper_error_class)
        element.addClass('is-invalid')
        errorElement.text(message)
      },

      remove (element, settings) {
        const wrapperElement = element.parent()
        const errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback')

        wrapperElement.removeClass(settings.wrapper_error_class)
        element.removeClass('is-invalid')
        errorElement.remove()
      }
    },
    vertical_collection: {
      add (element, settings, message) {
        const wrapperElement = element.closest('.' + settings.wrapper_class.replace(/ /g, '.'))
        var errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback')

        if (!errorElement.length) {
          errorElement = $('<' + settings.error_tag + '>', { class: 'invalid-feedback d-block', text: message })
          element.closest('.form-check').parent().children('.form-check:last').after(errorElement)
          element.closest('.form-check').parent().children('.form-check:last').after(errorElement)
        }

        wrapperElement.addClass(settings.wrapper_error_class)
        wrapperElement.find('input:visible').addClass('is-invalid')
        errorElement.text(message)
      },
      remove (element, settings) {
        const wrapperElement = element.closest('.' + settings.wrapper_class.replace(/ /g, '.'))
        const errorElement = wrapperElement.find(settings.error_tag + '.invalid-feedback')

        wrapperElement.removeClass(settings.wrapper_error_class)
        errorElement.remove()
        wrapperElement.find('input:visible').removeClass('is-invalid')
      }
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

simpleFormFormBuilder.wrappers.horizontal_multi_select = simpleFormFormBuilder.wrappers.multi_select
simpleFormFormBuilder.wrappers.vertical_multi_select = simpleFormFormBuilder.wrappers.multi_select
simpleFormFormBuilder.wrappers.horizontal_collection = simpleFormFormBuilder.wrappers.vertical_collection

ClientSideValidations.formBuilders['SimpleForm::FormBuilder'] = simpleFormFormBuilder
