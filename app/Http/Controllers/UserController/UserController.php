<?php

namespace App\Http\Controllers\UserController;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{

    public function index()
    {
        return Inertia::render('user/index',
            [
                'users' => User::all(),
                 'flash' => [
                    'success' => session('success')
    ]
            ]);
    }

    public function getAll()
    {
//        return Inertia::render('user/index', [
//            'users' => User::all()
//        ]);
        $users = User::all();
        return response()->json([
            'users' => $users
        ]);
    }



    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);


       $user = new User();
       $user->name = $request->name;
       $user->email = $request->email;
       $user->password = Hash::make($request->password);
       $user->save();

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);

//        return Inertia::render('user/index', [
//            'users' => User::all()
//        ]);

    }

    public function edit(int $id)
    {
        return Inertia::render('user/pages/userEdit', [
            'user' => User::find($id)
        ]);
    }

    public function update(int $id, Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
        ]);

        $user = User::findOrFail($id);
        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return response()->json([
            'user' => $user
        ]);
    }

    public function delete(int $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Kullanıcı başarıyla silindi'
        ]);
    }


}
