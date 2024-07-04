@extends('layouts.app')
@push('styles')
<link href="{{ asset('plugins/css/bootstrap2.css') }}" rel="stylesheet">
<link href="{{ asset('plugins/css/styles1.css') }}" rel="stylesheet">
<link href="{{ asset('plugins/css/plugins1.css') }}" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('plugins/toastr/toastr.min.css') }}">
@endpush
@section('content')

<div class="main-content">
    <div class="wrap-content container" id="container">
        <!-- start: PAGE TITLE -->
        <section id="page-title">
            <div class="row">
                <div class="col-sm-8">
                    <h1 class="mainTitle">Users | Manage Users</h1>
                </div>
            </div>
        </section>
        <!-- end: PAGE TITLE -->
        <!-- start: BASIC EXAMPLE -->
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="portlet box grey-cascade" id="user_portlet">
                        <div class="portlet-title">
                            <div class="caption">
                                Manage Users
                            </div>
                            <div class="tools">
                                <a href="#user_portlet" class="collapse">
                                </a>
                                <a href="#user_portlet" class="reload">
                                </a>
                            </div>
                        </div>
                        <div class="portlet-body">
                            <div class="row">
                                <div class="col-md-12 form">
                                    <div class="form-group">
                                        <div class="col-md-2">
                                            <div class="btn-group">
                                                <button class="btn blue modals_btn_add_new_user">
                                                    Add New <i class="fa fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <table class="table table-striped table-bordered table-hover" id="manage_users_table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th> Name</th>
                                    <th> Email</th>
                                    <th> Phone Number</th>
                                    <th> Birthdate </th>
                                    <th> Creation Date</th>
                                    <th> Updation Date</th>
                                    <th> Action</th>
                                </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="user_modal" class="modal container fade" tabindex="-1" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
        <h4 class="modal-title">New User</h4>
    </div>
    <div class="modal-body">
        <div class="row">
            <div class="col-md-12 form">
                <form
                    action="{{ route('new.user') }}"
                    id="user_form" method="post" class="form-horizontal">
                    @csrf
                    <input type="hidden" name="id"/>

                    <div class="form-body">
                        <div class="alert alert-danger display-hide">
                            <button class="close" data-close="alert"></button>
                            You have some errors. Please check below.
                        </div>
                        <div class="alert alert-success display-hide">
                            <button class="close" data-close="alert"></button>
                            User added successfully, you can add new one or close this form.
                        </div>
                        <div class="form-group">
                            <label class="control-label col-md-3">Name <span class="required">
                                    * </span>
                            </label>

                            <div class="col-md-8">
                                <input type="text" name="name" data-required="1" class="form-control"/>
                            </div>
                            @error('name')
                            <div class="alert alert-danger" role="alert">
                                <strong>{{ $message }}</strong>
                            </div>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label class="control-label col-md-3">Email <span class="required">
                                    * </span>
                            </label>

                            <div class="col-md-8">
                                <input type="email" name="email" data-required="1" class="form-control"/>
                            </div>
                            @error('email')
                            <div class="alert alert-danger" role="alert">
                                <strong>{{ $message }}</strong>
                            </div>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label class="control-label col-md-3">Phone Number <span class="required">
                                    * </span>
                            </label>

                            <div class="col-md-8">
                                <input type="text" name="phone" data-required="1" class="form-control"/>
                            </div>
                            @error('phone')
                            <div class="alert alert-danger" role="alert">
                                <strong>{{ $message }}</strong>
                            </div>
                            @enderror
                        </div>
                        <div class="form-group">
                            <label class="control-label col-md-3">Date Of Birth <span class="required">
                                    * </span>
                            </label>

                            <div class="col-md-8">
                                <input type="text" name="date_of_birth" id="date_of_birth" data-required="1" class="form-control datepicker" autocomplete="off">
                            </div>
                            @error('date_of_birth')
                            <div class="alert alert-danger" role="alert">
                                <strong>{{ $message }}</strong>
                            </div>
                            @enderror
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" data-dismiss="modal" class="btn btn-default">Close</button>
        <button type="button" class="btn blue form_submit" data-form="#user_form">Save changes</button>
    </div>
</div>
@endsection
