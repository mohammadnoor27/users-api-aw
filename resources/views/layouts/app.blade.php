<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <title>Users Board</title>

    <!-- CSS here -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
          integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ asset('plugins/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/css/plugins.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/css/components.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/css/bootstrap.min.css') }}">
    @stack('styles')
    <link rel="stylesheet" href="{{ asset('plugins/css/themify-icons.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/datatables/plugins/bootstrap/datatables.bootstrap.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/bootstrap-wysihtml5/bootstrap-wysihtml5.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/bootstrap-modal/css/bootstrap-modal-bs3patch.css') }}">
    <link rel="stylesheet" href="{{ asset('plugins/bootstrap-modal/css/bootstrap-modal.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/css/bootstrap-datepicker.min.css">
    <style>
        .toast-center-center{
            bottom:50%;
            margin:0 auto 0 -250px;
            left:50%;
        }
    </style>
</head>
<body>
<nav class="navbar navbar-expand-sm sticky-top navbar-light bg-light">
    <div class="container">
        <a class="navbar-brand" href="#">
            Users Management System
        </a>
    </div>
</nav>
<main style="padding-top: 100px">
    @yield('content')
</main>
<script src="{{ asset('plugins/js/popper.min.js') }}"></script>
<script src="{{ asset('plugins/jquery/jquery.min.js') }}"></script>
<script src="{{ asset('plugins/js/bootstrap.min.js') }}"></script>
<script src="{{ asset('plugins/datatables/media/js/jquery.dataTables.min.js') }}"></script>
<script src="{{ asset('plugins/datatables/plugins/bootstrap/datatables.bootstrap.js') }}"></script>
<script src="{{ asset('plugins/bootstrap-modal/js/bootstrap-modal.js') }}"></script>
<script src="{{ asset('plugins/bootstrap-modal/js/bootstrap-modalmanager.js') }}"></script>
<script src="{{ asset('plugins/js/jquery.blockui.min.js') }}"></script>
<script src="{{ asset('plugins/jquery-validation/jquery.validate.js') }}"></script>
<script src="{{ asset('plugins/js/jquery.form.js') }}"></script>
<script src="{{ asset('plugins/uniform/js/jquery.uniform.js') }}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/js/bootstrap-datepicker.min.js"></script>
<script src="{{ asset('plugins/js/bootbox.all.min.js') }}"></script>
<script src="{{ asset('plugins/toastr/toastr.js') }}"></script>
<script src="{{ asset('plugins/js/app.js') }}"></script>
<script src="{{ asset('plugins/js/main.js') }}"></script>

</body>
</html>
