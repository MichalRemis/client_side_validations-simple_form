# frozen_string_literal: true

require 'action_view/test_helper'
require 'simple_form/cases/helper'

module ClientSideValidations
  module SimpleForm
    class FormHelperTest < ::ActionView::TestCase
      include ::ActionViewTestSetup
      include ::SimpleForm::ActionViewExtensions::FormHelper

      def client_side_form_settings_helper
        ''
      end

      def setup
        super

        @user = User.new

        ::ActionView::TestCase::TestController.any_instance.stubs(:action_name).returns('edit')
      end

      CSV_CONFIGURATION_PART_OF_HASH = {
        html_settings: {
          type:                'SimpleForm::FormBuilder',
          error_class:         'error',
          error_tag:           'span',
          wrapper_error_class: 'field_with_errors',
          wrapper_tag:         'div',
          wrapper_class:       'input',
          wrapper:             'default'
        },
        number_format: { separator: '.', delimiter: ',' }
      }.freeze

      def test_simple_form_for
        simple_form_for(@post, validate: true) do |f|
          concat f.input(:cost)
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[cost]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" /><div class="input string required post_cost"><label class="string required" for="post_cost"><abbr title="required">*</abbr> Cost</label><input aria-required="true" class="string required" id="post_cost" name="post[cost]" required="required" type="text" /></div></form>)

        assert_dom_equal expected, output_buffer
      end

      def test_nested_simple_fields_for_inherit_validation_settings
        post_with_category = Post.new
        post_with_category.category = Category.new

        simple_form_for(post_with_category, validate: true) do |f|
          concat f.simple_fields_for(:category) { |c|
            concat c.input(:title)
          }
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[category_attributes][title]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" /><div class="input string required post_category_title"><label class="string required" for="post_category_attributes_title"><abbr title="required">*</abbr> Title</label><input class="string required" required="required" aria-required="true" type="text" name="post[category_attributes][title]" id="post_category_attributes_title" /></div></form>)

        assert_dom_equal expected, output_buffer
      end

      def test_input_override
        simple_form_for(@post, validate: true) do |f|
          concat f.input(:cost, validate: false)
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge({ validators: {} })

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" /><div class="input string required post_cost"><label class="string required" for="post_cost"><abbr title="required">*</abbr> Cost</label><input aria-required="true" class="string required" id="post_cost" name="post[cost]" required="required" type="text" /></div></form>)

        assert_dom_equal expected, output_buffer
      end

      def test_input_override_with_custom_wrapper_name
        simple_form_for(@post, validate: true, wrapper: :default) do |f|
          concat f.input(:cost, validate: false, wrapper: :custom_date_wrapper)
        end

        csv_data = {
          html_settings: {
            type:                'SimpleForm::FormBuilder',
            error_class:         'error',
            error_tag:           'span',
            wrapper_error_class: 'field_with_errors',
            wrapper_tag:         'div',
            wrapper_class:       'input',
            wrapper:             'default'
          },
          number_format: { separator: '.', delimiter: ',' },
          validators:    {}
        }

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" /><div class="string required post_cost"><input class="form-control string required" data-client-side-validations-wrapper="custom_date_wrapper" type="text" name="post[cost]" id="post_cost" /></div></form>)

        assert_dom_equal expected, output_buffer
      end

      def test_collection_radio_buttons_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@post, validate: true) do |f|
          input_html = f.input(:cost, as: :radio_buttons)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[cost]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_collection_radio_buttons_validation_is_not_included_in_csv_hash_when_validate_false
        input_html = ''

        simple_form_for(@post, validate: true) do |f|
          input_html = f.input(:cost, as: :radio_buttons, validate: false)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge({ validators: {} })

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_collection_check_boxes_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@post, validate: true) do |f|
          input_html = f.input(:cost, as: :check_boxes)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[cost]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_date_input_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@post, validate: true) do |f|
          input_html = f.input(:cost, as: :date)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[cost]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_time_input_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@post, validate: true) do |f|
          input_html = f.input(:cost, as: :time)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[cost]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_datetime_input_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@post, validate: true) do |f|
          input_html = f.input(:cost, as: :datetime)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'post[cost]' => {
                presence: [{ message: "can't be blank" }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/posts" class="simple_form new_post" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_post" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_habtm_association_field_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@user, validate: true) do |f|
          input_html = f.association(:roles, as: :check_boxes)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'user[role_ids]' => {
                length: [{
                  messages: {
                    maximum: 'is too long (maximum is 99 characters)'
                  },
                  maximum:  99
                }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/users" class="simple_form new_user" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_user" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end

      def test_belongs_to_association_field_validation_is_included_in_csv_hash
        input_html = ''

        simple_form_for(@user, validate: true) do |f|
          input_html = f.association(:department, as: :radio_buttons)
          concat input_html
        end

        csv_data = CSV_CONFIGURATION_PART_OF_HASH.merge(
          {
            validators: {
              'user[department_id]' => {
                presence: [{ message: 'must exist' }]
              }
            }
          }
        )

        expected = %(<form accept-charset="UTF-8" action="/users" class="simple_form new_user" data-client-side-validations="#{CGI.escapeHTML(csv_data.to_json)}" id="new_user" method="post" novalidate="novalidate"><input name="utf8" type="hidden" value="&#x2713;" />#{input_html}</form>)

        assert_dom_equal expected, output_buffer
      end
    end
  end
end
