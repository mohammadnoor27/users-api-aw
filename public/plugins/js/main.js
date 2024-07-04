$(document).ready(function () {

    function formReset(id) {
        $('#' + id).find('.form-control').each(function (key, input) {
            window.inputss = input;
            $(input).val('').change();
        });
        $.uniform.update();
    }

    $('#manage_users_table').DataTable({
        responsive: true,
        processing: true,
        serverSide: true,
        paging: true,
        ajax: "",
        columns: [
            {data: 'id', name: 'id', width: "1%"},
            {data: 'name', name: 'name'},
            {data: 'email', name: 'email'},
            {data: 'phone', name: 'phone'},
            {data: 'date_of_birth', name: 'date_of_birth'},
            {data: 'created_at', name: 'created_at'},
            {data: 'updated_at', name: 'updated_at'},
            {
                data: 'id', name: 'id', orderable: false, searchable: false, render: function (data, type, row) {
                    return '<button class="btn default btn-xs purple-stripe modals_btn_edit_user" ' + 'aria-hidden="true" data-trigger="hover" data-placement="top" data-content="Edit user" data-container="body" data-id="' + data + '"> Edit </button>' +
                        '<a href="javascript:void(0)" class="btn default btn-xs red-stripe btn-del-user" data-id="' + data + '">Delete</a>'
                }
            },
        ],
        lengthMenu: [
            [10, 15, 20, -1],
            [10, 15, 20, "All"]
        ],
        pageLength: 10,
        pagingType: "bootstrap_full_number",
        language: {
            lengthMenu: "_MENU_ records",
            paginate: {
                previous: "Prev",
                next: "Next",
                last: "Last",
                first: "First"
            }
        },
    });

    $('body').on('click', '.modals_btn_add_new_user', function () {
        formReset('user_form');
        $('#user_modal').find('.modal-header').find('.modal-title').html('Add User')
        $('#user_form').find('.form-control').val();
        $('#user_form .alert-danger').hide();
        $('#user_modal').modal();
    });

    $('body').on('click', '.modals_btn_edit_user', function () {
        let editLink = '/users-api-aw-v1/public/get-user/' + $(this).attr('data-id');
        $('#user_modal').find('.modal-header').find('.modal-title').html('Edit User');
        $('#user_form .alert-danger').hide();

        $.getJSON(editLink, function (data) {
            $.each(data, function (userKey, userValue) {
                $('#user_form').find('*[name=' + userKey + ']').val(userValue);
            });
            $('#user_modal').modal();
        });
    });

    $('body').on('click', '.btn-del-user', function () {
        App.blockUI({
            target: '#user_modal',
            boxed: true
        });

        let deleteLink = '/users-api-aw-v1/public/del-user/' + $(this).attr('data-id');
        bootbox.confirm('Are you sure?', function (result) {
            if (result) {
                $.getJSON(deleteLink, function (data) {
                    App.unblockUI('#user_modal');
                    if (data.result) {
                        $('#manage_users_table').DataTable().ajax.reload(null, false);
                        App.alert({
                            type: 'success',
                            message: data.message,
                            closeInSeconds: 5,
                        });
                    } else {
                        App.alert({
                            type: 'danger',
                            message: data.message,
                            closeInSeconds: 5,
                        });
                    }
                });
            }
        });
    });

    $('.form_submit').on('click', function () {
        let target_form = $(this).attr('data-form');
        $(target_form).submit();
    });

    let form1 = $('#user_form');
    let error1 = $('.alert-danger', form1);
    let success1 = $('.alert-success', form1);

    $.validator.addMethod("validDOB", function(value, element) {
        // Check if date is valid and user is at least 18 years old
        if (!/Invalid|NaN/.test(new Date(value))) {
            var today = new Date();
            var birthDate = new Date(value);
            var age = today.getFullYear() - birthDate.getFullYear();
            var monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 18;
        }
        return false;
    }, "Please enter a valid date of birth.");


    form1.validate({
        errorElement: 'span',
        errorClass: 'help-block help-block-error',
        focusInvalid: false,
        ignore: "",
        rules: {
            name: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10
            },
            date_of_birth: {
                required: true,
                date: true,
                validDOB: true
            }
        },
        messages: {
            date_of_birth: {
                required: "Please enter your date of birth.",
                date: "Please enter a valid date format (e.g., YYYY-MM-DD).",
                validDOB: "You must be at least 18 years old."
            }
        },
        invalidHandler: function (event, validator) {
            success1.hide();
            error1.show();
            App.scrollTo(error1, -200);
        },
        highlight: function (element) {
            $(element)
                .closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element)
                .closest('.form-group').removeClass('has-error');
        },
        success: function (label) {
            label
                .closest('.form-group').removeClass('has-error');
        },
        submitHandler: function (form1) {

            $(form1).ajaxSubmit({
                success: function (data) {
                    console.log(data)
                    if (data.result) {
                        error1.hide();
                        let table = $('#manage_users_table').DataTable();
                        table.ajax.reload(null, false);
                        $('#user_modal').modal('hide');

                        if (data.action === 'add') {
                            App.alert({
                                container: '#user_modal .modal-body',
                                place: 'prepend',
                                type: 'success',
                                message: 'User added successfully',
                                close: true,
                                focus: 'true',
                                closeInSeconds: 5,
                                icon: 'check'
                            });
                        } else {
                            App.alert({
                                container: '#user_modal .modal-body',
                                place: 'prepend',
                                type: 'success',
                                message: 'User modified successfully',
                                close: true,
                                focus: 'true',
                                closeInSeconds: 10,
                                icon: 'check'
                            });
                        }

                    } else {
                        error1.hide();
                        App.alert({
                            container: '#user_modal .modal-body',
                            place: 'prepend',
                            type: 'danger',
                            message: data.message,
                            close: true,
                            focus: 'true',
                            closeInSeconds: 5,
                            icon: 'times'
                        });
                    }

                },
                error: function(xhr) {
                    if (xhr.status === 422) {
                        var errors = xhr.responseJSON.errors;
                        $.each(errors, function(key, value) {
                            App.alert({
                                container: '#user_modal .modal-body',
                                place: 'prepend',
                                type: 'danger',
                                message: value,
                                close: true,
                                focus: 'true',
                                closeInSeconds: 5,
                                icon: 'times'
                            });
                        });
                    } else {
                        // Handle other errors
                        console.error('Error:', xhr.responseJSON.message);
                    }
                }
            });
        }
    });

    if ($('#user_portlet table#manage_users_table').length > 0) {
        let table = $('#user_portlet table#manage_users_table').DataTable();
        table.ajax.reload(null, false);
    }

    if ($('.datepicker').length > 0) {
        $('.datepicker').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true
        });
    }
});
