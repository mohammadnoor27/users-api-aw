<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Yajra\DataTables\DataTables;
use App\Mail\WelcomeEmail;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function user_dashboard(Request $request)
    {
        if ($request->ajax()) {
            $data = User::all();
            return Datatables::of($data)
                ->addIndexColumn()
                ->rawColumns(['action'])
                ->make(true);
        }
        return view('users.dashboard');
    }

    public function new_user(CreateUserRequest $request)
    {
        $_userModel = User::where('email', $request->email)->first();

        if (!empty($request->id)) {
            $_dataArray = array(
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'date_of_birth' => $request->date_of_birth,
                'updated_at' => date("Y-m-d H:i:s")
            );
            User::where('id', $request->id)->update($_dataArray);
            $request->session()->flash('edit_user_status', 'User has been updated successfully');
            $_action = 'update';
        } else {
            if ($_userModel == null) {
                $_dataArray = array(
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'date_of_birth' => $request->date_of_birth,
                    'created_at' => date("Y-m-d H:i:s")
                );
                User::insert($_dataArray);
                $_action = 'add';
                Mail::to($request->email)->send(new WelcomeEmail($request->name));
            } else {
                return response()->json(array(
                    'result' => false
                ));
            }
        }
        return response()->json(array(
            'action' => $_action,
            'result' => true
        ));
    }
    public function get_user($id)
    {
        $_userModel = User::where('id', $id)->first();
        return response()->json($_userModel);
    }

    public function del_user($id)
    {
        try {
            User::where('id', $id)->delete();
            return response()->json(array(
                'result' => true,
                'message' => 'User has been deleted successfully'
            ));
        } catch (Exception $e) {
            return response()->json(array(
                'result' => false,
                'message' => 'Ops! something went wrong!'
            ));
        }
    }
}
